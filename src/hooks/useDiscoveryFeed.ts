import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface FeedItem {
  id: string;
  type: "restaurant" | "deal" | "editorial";
  slug: string;
  title: string;
  subtitle?: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  neighborhood?: string;
  cuisines?: string[];
  aiContext?: { reason: string; icon: string };
  isTrending?: boolean;
  isHot?: boolean;
  dealText?: string;
}

export function useDiscoveryFeed(filter: string, page: number = 0) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["discovery-feed", filter, page, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-discovery-feed", {
        body: { filter, userId: user?.id || null, page },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.items || []) as FeedItem[];
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}
