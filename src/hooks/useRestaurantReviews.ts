import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  restaurant_id: string;
  user_id: string;
  title: string | null;
  content: string;
  rating: number;
  helpful_votes: number | null;
  photos: string[] | null;
  status: string | null;
  created_at: string | null;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function useRestaurantReviews(restaurantId: string) {
  return useQuery({
    queryKey: ["restaurant-reviews", restaurantId],
    queryFn: async () => {
      // First get the reviews
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("status", "approved")
        .order("helpful_votes", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Then get profiles for each review
      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, username")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      return reviews.map(review => ({
        ...review,
        profile: profileMap.get(review.user_id) || null,
      })) as Review[];
    },
    enabled: !!restaurantId,
  });
}

export function useRefreshReviews(restaurantId: string) {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ["restaurant-reviews", restaurantId] });
  };
}
