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

    // Verify user
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Not authenticated");

    const { restaurant_id, menu_text, menu_image_base64, menu_image_mime } = await req.json();
    if (!restaurant_id) throw new Error("restaurant_id required");

    // Verify subscription
    const { data: sub } = await supabase
      .from("restaurant_subscriptions")
      .select("plan_name, status")
      .eq("restaurant_id", restaurant_id)
      .eq("status", "active")
      .maybeSingle();

    if (!sub || sub.plan_name !== "growth") {
      return new Response(
        JSON.stringify({ error: "Growth plan required for AI Menu Intelligence" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ai = await createAIProvider();
    const settings = await getAISettings();
    let parsedText: string;

    const menuPrompt = `You are a menu parser AI. Extract ALL dishes from this menu.
For each dish return a JSON array of objects with these fields:
- dish_name (string)
- category (string: "Appetizer", "Main Course", "Dessert", "Beverage", "Side", "Other")
- ingredients (string array, best guess)
- dietary_tags (string array from: "Spicy", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Dairy-Free", "Nut-Free")
- estimated_price (number or null)
- spice_level (string: "None", "Mild", "Medium", "High", "Very High")

Return ONLY a valid JSON array.`;

    if (menu_image_base64 && menu_image_mime) {
      parsedText = await ai.analyzeImage({
        model: settings.vision_model,
        imageBase64: menu_image_base64,
        mimeType: menu_image_mime,
        prompt: menuPrompt,
      });
    } else if (menu_text) {
      const result = await ai.chatCompletion({
        model: settings.vision_model,
        messages: [
          { role: "system", content: menuPrompt },
          { role: "user", content: `Here is the menu text:\n\n${menu_text}` },
        ],
        temperature: 0.2,
      });
      parsedText = result.text;
    } else {
      throw new Error("Provide menu_text or menu_image_base64");
    }

    // Parse the result
    let dishes: any[];
    try {
      dishes = JSON.parse(parsedText);
    } catch {
      const match = parsedText.match(/\[[\s\S]*\]/);
      if (match) {
        dishes = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response as dish array");
      }
    }

    // Save to database
    const dishRows = dishes.map((d: any) => ({
      restaurant_id,
      dish_name: d.dish_name || d.name || "Unknown",
      category: d.category || "Other",
      ingredients: d.ingredients || [],
      dietary_tags: d.dietary_tags || [],
      price: d.estimated_price || null,
      ai_spice_level: d.spice_level || "None",
    }));

    if (dishRows.length > 0) {
      const { error: insertError } = await supabase
        .from("restaurant_dishes")
        .insert(dishRows);
      if (insertError) console.error("Insert error:", insertError);
    }

    return new Response(
      JSON.stringify({ dishes: dishRows, count: dishRows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
