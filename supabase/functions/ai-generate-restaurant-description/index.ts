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
    const { restaurantId } = await req.json();

    if (!restaurantId) {
      return new Response(JSON.stringify({ error: "restaurantId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("id, name, neighborhood, cuisines, price_range, signature_dishes, popular_dishes, tags, ambience, is_halal, has_delivery, has_outdoor_seating, is_family_friendly, average_rating, total_reviews")
      .eq("id", restaurantId)
      .single();

    if (error || !restaurant) {
      return new Response(JSON.stringify({ error: "Restaurant not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get top reviews for context
    const { data: reviews } = await supabase
      .from("reviews")
      .select("content, rating")
      .eq("restaurant_id", restaurantId)
      .eq("status", "approved")
      .order("helpful_votes", { ascending: false })
      .limit(5);

    const reviewContext = reviews?.map((r: any) => `"${r.content}" (${r.rating}/5)`).join("\n") || "No reviews yet.";

    const aiData = await ai.chatCompletion({
      messages: [
        {
          role: "system",
          content: `You are a food writer generating restaurant descriptions for a discovery platform in Lahore, Pakistan. Write engaging, SEO-friendly descriptions. Be specific and evocative.`,
        },
        {
          role: "user",
          content: `Generate descriptions for this restaurant:
Name: ${restaurant.name}
Location: ${restaurant.neighborhood || restaurant.city || "Pakistan"}
Cuisines: ${restaurant.cuisines?.join(", ") || "Various"}
Price: ${restaurant.price_range || "$$"}
Dishes: ${[...(restaurant.signature_dishes || []), ...(restaurant.popular_dishes || [])].join(", ") || "Various"}
Ambience: ${restaurant.ambience || "Casual"}
Rating: ${restaurant.average_rating}/5 (${restaurant.total_reviews} reviews)
Features: ${[restaurant.is_halal ? "Halal" : "", restaurant.has_delivery ? "Delivery" : "", restaurant.has_outdoor_seating ? "Outdoor seating" : "", restaurant.is_family_friendly ? "Family friendly" : ""].filter(Boolean).join(", ")}

Top Reviews:\n${reviewContext}`,
        },
      ],
      responseSchema: {
        type: "object",
        properties: {
          description_short: { type: "string" },
          description_long: { type: "string" },
          vibe_tags: { type: "array", items: { type: "string" } },
        },
        required: ["description_short", "description_long", "vibe_tags"],
      },
    });

    const result = aiData.parsed;
    if (!result) throw new Error("AI failed to generate description");

    // Save to database
    await supabase.from("restaurants").update({
      ai_description_short: result.description_short,
      ai_description_long: result.description_long,
      ai_vibe_tags: result.vibe_tags || [],
      // Also set main description if empty
      ...(restaurant.description ? {} : { description: result.description_long }),
      ...(restaurant.short_description ? {} : { short_description: result.description_short }),
    }).eq("id", restaurantId);

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Description generation error:", e);
    const status = e instanceof AIError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
