import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website: string | null;
  cuisines: string[];
  price_range: string;
  is_halal: boolean;
  is_family_friendly: boolean;
  has_delivery: boolean;
  cover_image: string | null;
  signature_dishes: string[];
  google_rating: number;
  google_review_count: number;
  tiktok_trend_score: number;
  internal_votes: number;
  total_reviews: number;
  average_rating: number;
  ranking_score: number;
  city_rank: number | null;
  is_verified: boolean;
  is_promoted: boolean;
};

export function useRestaurants(options?: {
  limit?: number;
  cuisine?: string;
  priceRange?: string;
  neighborhood?: string;
  isHalal?: boolean;
  sortBy?: "ranking" | "rating" | "reviews" | "trending";
  search?: string;
}) {
  return useQuery({
    queryKey: ["restaurants", options],
    queryFn: async () => {
      let query = supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true);

      if (options?.cuisine) {
        query = query.contains("cuisines", [options.cuisine]);
      }

      if (options?.priceRange) {
        query = query.eq("price_range", options.priceRange as "$" | "$$" | "$$$" | "$$$$");
      }

      if (options?.neighborhood) {
        query = query.eq("neighborhood", options.neighborhood);
      }

      if (options?.isHalal) {
        query = query.eq("is_halal", true);
      }

      if (options?.search) {
        query = query.or(`name.ilike.%${options.search}%,neighborhood.ilike.%${options.search}%`);
      }

      // Sort
      switch (options?.sortBy) {
        case "rating":
          query = query.order("average_rating", { ascending: false });
          break;
        case "reviews":
          query = query.order("total_reviews", { ascending: false });
          break;
        case "trending":
          query = query.order("tiktok_trend_score", { ascending: false });
          break;
        default:
          query = query.order("ranking_score", { ascending: false });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Restaurant[];
    },
  });
}

export function useRestaurant(slug: string) {
  return useQuery({
    queryKey: ["restaurant", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Restaurant | null;
    },
    enabled: !!slug,
  });
}

export function useTopRestaurants(limit = 100) {
  return useQuery({
    queryKey: ["top-restaurants", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("ranking_score", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Restaurant[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data;
    },
  });
}
