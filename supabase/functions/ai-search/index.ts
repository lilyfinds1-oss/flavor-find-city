import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIProvider, AIError } from "../_shared/ai-provider.ts";
import { getCached, setCache } from "../_shared/cache.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CACHE_TTL_SECONDS = 600;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query } = await req.json();
    if (!query?.trim()) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cacheKey = `search:${query.trim().toLowerCase()}`;
    const cached = await getCached(supabase, cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ ...cached, fromCache: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await createAIProvider();
    let candidates: any[] = [];
    let usedVector = false;

    // Stage 1: Vector similarity search
    try {
      const queryEmbedding = await ai.generateEmbedding(query);
      const { data: vectorResults, error: vecError } = await supabase.rpc("match_restaurants", {
        query_embedding: `[${queryEmbedding.join(",")}]`,
        match_threshold: 0.25,
        match_count: 15,
      });
      if (!vecError && vectorResults?.length > 0) {
        candidates = vectorResults;
        usedVector = true;
      }
    } catch (e) {
      console.log("Vector search unavailable, falling back to keyword:", e instanceof Error ? e.message : e);
    }

    // Fallback: keyword fetch
    if (!usedVector || candidates.length < 3) {
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, name, slug, neighborhood, cuisines, price_range, average_rating, cover_image, is_halal, has_delivery, signature_dishes, description, total_reviews, tags, ambience, short_description, popular_dishes")
        .eq("is_active", true)
        .order("ranking_score", { ascending: false })
        .limit(50);

      if (restaurants?.length) {
        const existingIds = new Set(candidates.map((c: any) => c.id));
        const additional = restaurants.filter((r: any) => !existingIds.has(r.id));
        candidates = [...candidates, ...additional].slice(0, 20);
      }
    }

    if (!candidates.length) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stage 2: Gemini re-ranking
    const candidateContext = candidates.slice(0, 15).map((r: any) => ({
      id: r.id, name: r.name, neighborhood: r.neighborhood,
      cuisines: r.cuisines, price_range: r.price_range,
      average_rating: r.average_rating, is_halal: r.is_halal,
      has_delivery: r.has_delivery, signature_dishes: r.signature_dishes,
      tags: r.tags, ambience: r.ambience, popular_dishes: r.popular_dishes,
      description: (r.short_description || r.description)?.substring(0, 80),
    }));

    const aiData = await ai.chatCompletion({
      messages: [
        {
          role: "system",
          content: `You are a semantic search engine for restaurants in Pakistan. Given a natural language query and pre-filtered restaurant candidates, rank them by relevance. For each match, provide a short reason (max 10 words). Return at most 10 results as a JSON array.`,
        },
        {
          role: "user",
          content: `Query: "${query}"\n\nCandidates:\n${JSON.stringify(candidateContext)}`,
        },
      ],
      responseSchema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                reason: { type: "string" },
              },
              required: ["id", "reason"],
            },
          },
        },
        required: ["results"],
      },
    });

    const aiResults = aiData.parsed?.results || [];

    const candidateMap = new Map(candidates.map((r: any) => [r.id, r]));
    const enrichedResults = aiResults
      .filter((r: any) => candidateMap.has(r.id))
      .map((r: any) => {
        const full = candidateMap.get(r.id);
        return {
          id: full.id, name: full.name, slug: full.slug,
          neighborhood: full.neighborhood, cuisines: full.cuisines,
          price_range: full.price_range, average_rating: full.average_rating,
          cover_image: full.cover_image, total_reviews: full.total_reviews,
          is_halal: full.is_halal, has_delivery: full.has_delivery,
          aiReason: r.reason, similarity: full.similarity,
        };
      });

    const responseBody = { results: enrichedResults, usedVector };
    await setCache(supabase, cacheKey, "search", responseBody, CACHE_TTL_SECONDS);

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI search error:", e);
    const status = e instanceof AIError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
