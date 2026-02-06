import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RecentReview {
  id: string;
  title: string | null;
  content: string;
  rating: number;
  created_at: string | null;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    cover_image: string | null;
    neighborhood: string | null;
  } | null;
  profile: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
}

export function useRecentReviews(limit = 6) {
  return useQuery({
    queryKey: ["recent-reviews", limit],
    queryFn: async () => {
      // Fetch recent approved reviews
      const { data: reviews, error } = await supabase
        .from("reviews")
        .select("id, title, content, rating, created_at, restaurant_id, user_id")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get unique restaurant and user IDs
      const restaurantIds = [...new Set(reviews.map((r) => r.restaurant_id))];
      const userIds = [...new Set(reviews.map((r) => r.user_id))];

      // Fetch restaurants
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, name, slug, cover_image, neighborhood")
        .in("id", restaurantIds);

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, username")
        .in("id", userIds);

      const restaurantMap = new Map(restaurants?.map((r) => [r.id, r]) || []);
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return reviews.map((review) => ({
        id: review.id,
        title: review.title,
        content: review.content,
        rating: review.rating,
        created_at: review.created_at,
        restaurant: restaurantMap.get(review.restaurant_id) || null,
        profile: profileMap.get(review.user_id) || null,
      })) as RecentReview[];
    },
  });
}
