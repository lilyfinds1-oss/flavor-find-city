import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";

export function useTopRatedRestaurants(limit = 6) {
  const { city } = useCity();
  return useQuery({
    queryKey: ["top-rated-restaurants", limit, city?.name],
    queryFn: async () => {
      let query = supabase
        .from("restaurants")
        .select("id, name, slug, cover_image, neighborhood, average_rating, total_reviews, price_range, cuisines")
        .eq("is_active", true)
        .order("average_rating", { ascending: false })
        .order("total_reviews", { ascending: false })
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
