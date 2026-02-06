import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTopRatedRestaurants(limit = 6) {
  return useQuery({
    queryKey: ["top-rated-restaurants", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, slug, cover_image, neighborhood, average_rating, total_reviews, price_range, cuisines")
        .eq("is_active", true)
        .order("average_rating", { ascending: false })
        .order("total_reviews", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
