import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIProvider, getAISettings, AIError } from "../_shared/ai-provider.ts";
import { getCached, setCache } from "../_shared/cache.ts";

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

    const { userId } = await req.json();
    if (!userId) {
      return new Response(JSON.stringify({ error: "userId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check cache
    const cacheKey = `recs:${userId}`;
    const cached = await getCached(supabase, cacheKey);
    if (cached) {
      return new Response(JSON.stringify({ ...cached, fromCache: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ai = await createAIProvider();
    const settings = await getAISettings();

    // Gather user activity
    const [{ data: activity }, { data: saved }, { data: reviews }, { data: restaurants }] = await Promise.all([
      supabase.from("user_activity").select("activity_type, entity_id, metadata, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("saved_restaurants").select("restaurant_id, restaurants(name, cuisines, neighborhood, price_range)").eq("user_id", userId).limit(20),
      supabase.from("reviews").select("restaurant_id, rating, restaurants(name, cuisines, neighborhood)").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
      supabase.from("restaurants").select("id, name, slug, neighborhood, cuisines, price_range, average_rating, cover_image, signature_dishes, tags, total_reviews, tiktok_trend_score").eq("is_active", true).order("ranking_score", { ascending: false }).limit(50),
    ]);

    // Build user profile context
    const savedContext = saved?.map((s: any) => `Saved: ${s.restaurants?.name} (${s.restaurants?.cuisines?.join(", ")} in ${s.restaurants?.neighborhood})`).join("\n") || "";
    const reviewContext = reviews?.map((r: any) => `Reviewed ${r.restaurants?.name} (${r.rating}/5, ${r.restaurants?.cuisines?.join(", ")})`).join("\n") || "";
    const activityContext = activity?.map((a: any) => `${a.activity_type}: ${a.entity_id} ${a.metadata ? JSON.stringify(a.metadata) : ""}`).join("\n") || "";

    const restaurantList = (restaurants || []).map((r: any) => ({
      id: r.id, name: r.name, slug: r.slug, neighborhood: r.neighborhood,
      cuisines: r.cuisines, price_range: r.price_range,
      average_rating: r.average_rating, cover_image: r.cover_image,
      signature_dishes: r.signature_dishes, tags: r.tags,
      total_reviews: r.total_reviews, tiktok_trend_score: r.tiktok_trend_score,
    }));

    // Already visited/reviewed restaurant IDs
    const visitedIds = new Set([
      ...(saved?.map((s: any) => s.restaurant_id) || []),
      ...(reviews?.map((r: any) => r.restaurant_id) || []),
    ]);

    const aiData = await ai.chatCompletion({
      model: settings.recommendation_model,
      messages: [
        {
          role: "system",
          content: `You are a personalized restaurant recommendation engine for Pakistan. Analyze the user's history and recommend restaurants they haven't visited yet. Prioritize restaurants matching their taste patterns. Return 5-8 recommendations.`,
        },
        {
          role: "user",
          content: `USER HISTORY:\n${savedContext}\n${reviewContext}\n${activityContext}\n\nAVAILABLE RESTAURANTS:\n${JSON.stringify(restaurantList)}\n\nALREADY VISITED IDs: ${[...visitedIds].join(", ")}`,
        },
      ],
      responseSchema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                restaurant_id: { type: "string" },
                reason: { type: "string" },
                confidence: { type: "number" },
              },
              required: ["restaurant_id", "reason", "confidence"],
            },
          },
        },
        required: ["recommendations"],
      },
    });

    const recs = aiData.parsed?.recommendations || [];
    const restaurantMap = new Map((restaurants || []).map((r: any) => [r.id, r]));

    const enrichedRecs = recs
      .filter((r: any) => restaurantMap.has(r.restaurant_id))
      .map((r: any) => {
        const rest = restaurantMap.get(r.restaurant_id);
        return {
          restaurant_id: r.restaurant_id,
          reason: r.reason,
          confidence: r.confidence,
          restaurant: {
            id: rest.id, name: rest.name, slug: rest.slug,
            neighborhood: rest.neighborhood, cuisines: rest.cuisines,
            price_range: rest.price_range, average_rating: rest.average_rating,
            cover_image: rest.cover_image, total_reviews: rest.total_reviews,
          },
        };
      });

    const responseBody = { recommendations: enrichedRecs };
    await setCache(supabase, cacheKey, "recommendations", responseBody, 600); // 10 min

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Recommendations error:", e);
    // On AI credit exhaustion or other AI errors, return empty results gracefully
    if (e instanceof AIError && (e.status === 402 || e.status === 429)) {
      return new Response(JSON.stringify({ recommendations: [], aiUnavailable: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const status = e instanceof AIError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
