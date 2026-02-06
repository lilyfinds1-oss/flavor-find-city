import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useFeaturedDeals(limit = 4) {
  return useQuery({
    queryKey: ["featured-deals", limit],
    queryFn: async () => {
      const { data: deals, error } = await supabase
        .from("deals")
        .select("id, title, description, deal_type, discount_value, xp_cost, expires_at, restaurant_id")
        .eq("is_active", true)
        .order("xp_cost", { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Fetch restaurants for the deals
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
  });
}
