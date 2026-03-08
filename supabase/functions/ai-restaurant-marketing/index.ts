import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIProvider, getAISettings } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const { restaurant_id, content_type, special_dish, promotion_type, custom_prompt } = await req.json();
    if (!restaurant_id) throw new Error("restaurant_id required");

    // Verify subscription (both starter and growth have marketing)
    const { data: sub } = await supabase
      .from("restaurant_subscriptions")
      .select("plan_name, status")
      .eq("restaurant_id", restaurant_id)
      .eq("status", "active")
      .maybeSingle();

    if (!sub) {
      return new Response(
        JSON.stringify({ error: "Active subscription required for AI Marketing Assistant" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get restaurant info
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("name, cuisines, neighborhood, city, signature_dishes, description, ai_vibe_tags")
      .eq("id", restaurant_id)
      .single();

    if (!restaurant) throw new Error("Restaurant not found");

    const ai = await createAIProvider();
    const settings = await getAISettings();

    const typeLabel = content_type || "instagram_caption";
    const promoContext = promotion_type ? `Promotion type: ${promotion_type}.` : "";
    const dishContext = special_dish ? `Featured dish: ${special_dish}.` : "";
    const customContext = custom_prompt ? `Additional context: ${custom_prompt}.` : "";

    const prompt = `You are a social media marketing expert for restaurants.
Generate marketing content for this restaurant:

Restaurant: ${restaurant.name}
Cuisine: ${restaurant.cuisines?.join(", ") || "Various"}
Location: ${restaurant.neighborhood || restaurant.city}
Signature Dishes: ${restaurant.signature_dishes?.join(", ") || "N/A"}
Vibe: ${restaurant.ai_vibe_tags?.join(", ") || "N/A"}
${dishContext}
${promoContext}
${customContext}

Generate the following content types as a JSON object:
{
  "instagram_caption": "An engaging Instagram caption with emojis (max 300 chars)",
  "facebook_post": "A longer Facebook post (max 500 chars)",
  "short_ad_copy": "A punchy ad copy (max 150 chars)",
  "hashtags": ["array", "of", "relevant", "hashtags"],
  "event_announcement": "An event/promotion announcement (max 400 chars)"
}

${typeLabel !== "all" ? `Focus especially on making the ${typeLabel} exceptional.` : ""}

Make it compelling, use emojis, and match the restaurant's vibe. Return ONLY valid JSON.`;

    const result = await ai.chatCompletion({
      model: settings.default_model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    let content: any;
    try {
      content = JSON.parse(result.text);
    } catch {
      const match = result.text.match(/\{[\s\S]*\}/);
      if (match) content = JSON.parse(match[0]);
      else throw new Error("Failed to parse marketing content");
    }

    return new Response(
      JSON.stringify({ content, restaurant_name: restaurant.name }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
