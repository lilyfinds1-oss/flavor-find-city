import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTrendingRestaurants(limit = 6) {
  return useQuery({
    queryKey: ["trending-restaurants", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, slug, cover_image, neighborhood, average_rating, internal_votes, tiktok_trend_score, price_range, cuisines")
        .eq("is_active", true)
        .order("internal_votes", { ascending: false })
        .order("tiktok_trend_score", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
