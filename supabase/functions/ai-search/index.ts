import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { query } = await req.json();
    if (!query?.trim()) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all active restaurants for AI to rank
    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("id, name, slug, neighborhood, cuisines, price_range, average_rating, cover_image, is_halal, has_delivery, signature_dishes, description, total_reviews")
      .eq("is_active", true)
      .order("ranking_score", { ascending: false })
      .limit(200);

    if (!restaurants?.length) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const restaurantContext = restaurants.map((r: any) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      neighborhood: r.neighborhood,
      cuisines: r.cuisines,
      price_range: r.price_range,
      average_rating: r.average_rating,
      is_halal: r.is_halal,
      has_delivery: r.has_delivery,
      signature_dishes: r.signature_dishes,
      description: r.description?.substring(0, 100),
      total_reviews: r.total_reviews,
      cover_image: r.cover_image,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a semantic search engine for restaurants in Lahore, Pakistan. Given a natural language query and a list of restaurants, return the most relevant matches ranked by relevance. For each match, provide a short reason (max 10 words) explaining why it matches. Return at most 10 results. Consider cuisine types, neighborhoods, price ranges, dietary needs, ambiance, dish names, and general vibes.`,
          },
          {
            role: "user",
            content: `Query: "${query}"\n\nRestaurants:\n${JSON.stringify(restaurantContext)}`,
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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI search error:", response.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const aiResults = parsed.results || [];

    // Map AI results back to full restaurant data
    const restaurantMap = new Map(restaurants.map((r: any) => [r.id, r]));
    const enrichedResults = aiResults
      .filter((r: any) => restaurantMap.has(r.id))
      .map((r: any) => ({
        ...restaurantMap.get(r.id),
        aiReason: r.reason,
      }));

    return new Response(JSON.stringify({ results: enrichedResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("AI search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
