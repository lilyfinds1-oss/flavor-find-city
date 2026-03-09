import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";

export function useTrendingRestaurants(limit = 6) {
  const { city } = useCity();
  return useQuery({
    queryKey: ["trending-restaurants", limit, city?.name],
    queryFn: async () => {
      let query = supabase
        .from("restaurants")
        .select("id, name, slug, cover_image, neighborhood, average_rating, internal_votes, tiktok_trend_score, price_range, cuisines")
        .eq("is_active", true)
        .order("internal_votes", { ascending: false })
        .order("tiktok_trend_score", { ascending: false })
        .limit(limit);

      if (city?.name) {
        query = query.eq("city", city.name);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!city,
  });
}
