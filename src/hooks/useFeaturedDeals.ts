import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";

export function useFeaturedDeals(limit = 4) {
  const { city } = useCity();
  return useQuery({
    queryKey: ["featured-deals", limit, city?.name],
    queryFn: async () => {
      // First get restaurant IDs in the selected city
      let restaurantQuery = supabase
        .from("restaurants")
        .select("id")
        .eq("is_active", true);

      if (city?.name) {
        restaurantQuery = restaurantQuery.eq("city", city.name);
      }

      const { data: cityRestaurants } = await restaurantQuery;
      const cityRestaurantIds = cityRestaurants?.map((r) => r.id) || [];

      if (cityRestaurantIds.length === 0) return [];

      const { data: deals, error } = await supabase
        .from("deals")
        .select("id, title, description, deal_type, discount_value, xp_cost, expires_at, restaurant_id")
        .eq("is_active", true)
        .in("restaurant_id", cityRestaurantIds)
        .order("xp_cost", { ascending: true })
        .limit(limit);

      if (error) throw error;

      const restaurantIds = [...new Set(deals.map((d) => d.restaurant_id))];
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, name, slug, cover_image, neighborhood")
        .in("id", restaurantIds);

      const restaurantMap = new Map(restaurants?.map((r) => [r.id, r]) || []);

      return deals.map((deal) => ({
        ...deal,
        restaurant: restaurantMap.get(deal.restaurant_id) || null,
      }));
    },
    enabled: !!city,
  });
}
