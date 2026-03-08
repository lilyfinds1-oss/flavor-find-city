import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIProvider, getAISettings, AIError } from "../_shared/ai-provider.ts";

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
    const settings = await getAISettings();

    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Recognize dish with vision model
    const visionResult = await ai.analyzeImage({
      model: settings.vision_model,
      imageBase64,
      mimeType: mimeType || "image/jpeg",
      prompt: `Analyze this food photo and return a JSON object with these fields:
- dish_name: name of the dish (string)
- cuisine_type: type of cuisine e.g. Pakistani, Indian, Chinese (string)
- ingredients_guess: array of likely ingredients (string[])
- confidence: your confidence 0.0-1.0 (number)
- description: brief appetizing description (string)

If this is not food, set dish_name to "Not food" and confidence to 0.`,
    });

    let dish: any;
    try {
      dish = JSON.parse(visionResult);
    } catch {
      const jsonMatch = visionResult.match(/\{[\s\S]*\}/);
      dish = jsonMatch ? JSON.parse(jsonMatch[0]) : { dish_name: "Unknown", confidence: 0 };
    }

    // Step 2: Find matching restaurants
    let nearbyRestaurants: any[] = [];
    if (dish.dish_name && dish.dish_name !== "Not food" && dish.confidence > 0.3) {
      const searchTerms = [dish.dish_name, dish.cuisine_type].filter(Boolean);

      // Search by popular_dishes, signature_dishes, and cuisines
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, name, slug, neighborhood, cuisines, price_range, average_rating, cover_image, signature_dishes, popular_dishes, total_reviews")
        .eq("is_active", true)
        .order("ranking_score", { ascending: false })
        .limit(100);

      if (restaurants) {
        // Score restaurants by relevance to dish
        nearbyRestaurants = restaurants
          .map((r: any) => {
            let score = 0;
            const allDishes = [...(r.signature_dishes || []), ...(r.popular_dishes || [])].map((d: string) => d.toLowerCase());
            const dishLower = dish.dish_name.toLowerCase();

            if (allDishes.some((d: string) => d.includes(dishLower) || dishLower.includes(d))) score += 10;
            if (r.cuisines?.some((c: string) => c.toLowerCase().includes(dish.cuisine_type?.toLowerCase() || ""))) score += 5;
            if ((r.average_rating || 0) > 4) score += 2;
            return { ...r, matchScore: score };
          })
          .filter((r: any) => r.matchScore > 0)
          .sort((a: any, b: any) => b.matchScore - a.matchScore)
          .slice(0, 5)
          .map((r: any) => ({
            id: r.id, name: r.name, slug: r.slug,
            neighborhood: r.neighborhood, cuisines: r.cuisines,
            price_range: r.price_range, average_rating: r.average_rating,
            cover_image: r.cover_image, total_reviews: r.total_reviews,
          }));
      }
    }

    return new Response(JSON.stringify({
      dish,
      nearby_restaurants: nearbyRestaurants,
      ai_description: dish.description || "",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Dish recognition error:", e);
    const status = e instanceof AIError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
