import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIProvider, AIError } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const ai = await createAIProvider();
    const { query } = await req.json();

    if (!query?.trim()) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let candidates: any[] = [];
    let usedVector = false;

    // Stage 1: Try vector similarity search first
    try {
      const queryEmbedding = await ai.generateEmbedding(query);
      const { data: vectorResults, error: vecError } = await supabase.rpc("match_restaurants", {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.25,
        match_count: 15,
      });

      if (!vecError && vectorResults?.length > 0) {
        candidates = vectorResults;
        usedVector = true;
      }
    } catch (e) {
      // Embeddings not available (no OpenAI key or no embeddings generated)
      console.log("Vector search unavailable, falling back to keyword:", e instanceof Error ? e.message : e);
    }

    // Fallback: keyword fetch if vector search didn't work
    if (!usedVector || candidates.length < 3) {
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, name, slug, neighborhood, cuisines, price_range, average_rating, cover_image, is_halal, has_delivery, signature_dishes, description, total_reviews, tags, ambience, short_description, popular_dishes")
        .eq("is_active", true)
        .order("ranking_score", { ascending: false })
        .limit(50);

      if (restaurants?.length) {
        // Merge with any vector results (vector results first)
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

    // Stage 2: LLM re-ranking with explanations (send only top candidates)
    const candidateContext = candidates.slice(0, 15).map((r: any) => ({
      id: r.id,
      name: r.name,
      neighborhood: r.neighborhood,
      cuisines: r.cuisines,
      price_range: r.price_range,
      average_rating: r.average_rating,
      is_halal: r.is_halal,
      has_delivery: r.has_delivery,
      signature_dishes: r.signature_dishes,
      tags: r.tags,
      ambience: r.ambience,
      popular_dishes: r.popular_dishes,
      description: (r.short_description || r.description)?.substring(0, 80),
    }));

    const aiData = await ai.chatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a semantic search engine for restaurants in Lahore, Pakistan. Given a natural language query and pre-filtered restaurant candidates, rank them by relevance. For each match, provide a short reason (max 10 words). Return at most 10 results. Consider cuisine types, neighborhoods, price ranges, dietary needs, ambiance, dish names, and general vibes.`,
        },
        {
          role: "user",
          content: `Query: "${query}"\n\nCandidates:\n${JSON.stringify(candidateContext)}`,
        },
      ],
      tools: [{
        type: "function",
        function: {
          name: "return_results",
          description: "Return ranked search results",
          parameters: {
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
                  additionalProperties: false,
                },
              },
            },
            required: ["results"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "return_results" } },
    });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const aiResults = parsed.results || [];

    // Map back to full data
    const candidateMap = new Map(candidates.map((r: any) => [r.id, r]));
    const enrichedResults = aiResults
      .filter((r: any) => candidateMap.has(r.id))
      .map((r: any) => {
        const full = candidateMap.get(r.id);
        return {
          id: full.id,
          name: full.name,
          slug: full.slug,
          neighborhood: full.neighborhood,
          cuisines: full.cuisines,
          price_range: full.price_range,
          average_rating: full.average_rating,
          cover_image: full.cover_image,
          total_reviews: full.total_reviews,
          is_halal: full.is_halal,
          has_delivery: full.has_delivery,
          aiReason: r.reason,
          similarity: full.similarity,
        };
      });

    return new Response(JSON.stringify({ results: enrichedResults, usedVector }), {
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
