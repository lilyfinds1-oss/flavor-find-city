import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AISearchResult {
  id: string;
  name: string;
  slug: string;
  neighborhood: string | null;
  cuisines: string[] | null;
  price_range: string | null;
  average_rating: number | null;
  cover_image: string | null;
  total_reviews: number | null;
  is_halal: boolean;
  has_delivery: boolean;
  aiReason: string;
}

export function useAISearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["ai-search", query],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-search", {
        body: { query },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.results || []) as AISearchResult[];
    },
    enabled: enabled && query.trim().length >= 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// Determine if a query is "natural language" vs simple keyword
export function isNaturalLanguageQuery(query: string): boolean {
  const words = query.trim().split(/\s+/);
  if (words.length >= 3) return true;
  const nlKeywords = ["best", "cheap", "near", "good", "fancy", "spicy", "like", "similar", "where", "find", "recommend", "suggest", "top", "affordable", "romantic", "family", "late", "night", "breakfast", "lunch", "dinner"];
  return words.some((w) => nlKeywords.includes(w.toLowerCase()));
}
