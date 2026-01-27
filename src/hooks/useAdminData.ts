import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type RestaurantInsert = Database["public"]["Tables"]["restaurants"]["Insert"];
type RestaurantUpdate = Database["public"]["Tables"]["restaurants"]["Update"];
type Review = Database["public"]["Tables"]["reviews"]["Row"];
type ReviewStatus = Database["public"]["Enums"]["review_status"];

// Restaurant management
export function useAdminRestaurants() {
  return useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Restaurant[];
    },
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurant: RestaurantInsert) => {
      const { data, error } = await supabase
        .from("restaurants")
        .insert(restaurant)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: RestaurantUpdate }) => {
      const { data, error } = await supabase
        .from("restaurants")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

// Review moderation
export function useAdminReviews(status?: ReviewStatus) {
  return useQuery({
    queryKey: ["admin-reviews", status],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select(`
          *,
          restaurants:restaurant_id (name, slug),
          profiles:user_id (username, display_name, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateReviewStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReviewStatus }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
  });
}

// Analytics
export function useAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [restaurantsRes, reviewsRes, usersRes, dealsRes] = await Promise.all([
        supabase.from("restaurants").select("id, created_at, is_active", { count: "exact" }),
        supabase.from("reviews").select("id, created_at, status, rating", { count: "exact" }),
        supabase.from("profiles").select("id, created_at, xp_points", { count: "exact" }),
        supabase.from("deals").select("id, is_active, current_redemptions", { count: "exact" }),
      ]);

      const totalRestaurants = restaurantsRes.count || 0;
      const activeRestaurants = restaurantsRes.data?.filter(r => r.is_active).length || 0;
      const totalReviews = reviewsRes.count || 0;
      const pendingReviews = reviewsRes.data?.filter(r => r.status === "pending").length || 0;
      const totalUsers = usersRes.count || 0;
      const totalXP = usersRes.data?.reduce((sum, u) => sum + (u.xp_points || 0), 0) || 0;
      const activeDeals = dealsRes.data?.filter(d => d.is_active).length || 0;
      const totalRedemptions = dealsRes.data?.reduce((sum, d) => sum + (d.current_redemptions || 0), 0) || 0;

      // Calculate average rating
      const approvedReviews = reviewsRes.data?.filter(r => r.status === "approved") || [];
      const avgRating = approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 0;

      return {
        totalRestaurants,
        activeRestaurants,
        totalReviews,
        pendingReviews,
        totalUsers,
        totalXP,
        activeDeals,
        totalRedemptions,
        avgRating,
      };
    },
  });
}
