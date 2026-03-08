import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIProvider, buildRestaurantEmbeddingText, AIError } from "../_shared/ai-provider.ts";

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
    const { restaurantId, batchAll } = await req.json();

    if (batchAll) {
      const { data: restaurants, error } = await supabase
        .from("restaurants")
        .select("id, name, description, short_description, neighborhood, cuisines, price_range, signature_dishes, popular_dishes, tags, ambience, is_halal, has_delivery, has_outdoor_seating, is_family_friendly")
        .eq("is_active", true)
        .is("embedding", null)
        .limit(50);

      if (error) throw error;
      if (!restaurants?.length) {
        return new Response(JSON.stringify({ message: "No restaurants need embeddings", processed: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let processed = 0;
      let errors = 0;

      for (const r of restaurants) {
        try {
          const text = buildRestaurantEmbeddingText(r);
          const embedding = await ai.generateEmbedding(text);
          const { error: updateError } = await supabase
            .from("restaurants")
            .update({ embedding: `[${embedding.join(",")}]` })
            .eq("id", r.id);

          if (updateError) { console.error(`Failed to save embedding for ${r.id}:`, updateError); errors++; }
          else { processed++; }

          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (e) {
          console.error(`Error generating embedding for ${r.name}:`, e);
          errors++;
          if (e instanceof AIError && e.status === 429) {
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }
        }
      }

      return new Response(JSON.stringify({ processed, errors, total: restaurants.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!restaurantId) {
      return new Response(JSON.stringify({ error: "restaurantId or batchAll required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select("id, name, description, short_description, neighborhood, cuisines, price_range, signature_dishes, popular_dishes, tags, ambience, is_halal, has_delivery, has_outdoor_seating, is_family_friendly")
      .eq("id", restaurantId)
      .single();

    if (error || !restaurant) {
      return new Response(JSON.stringify({ error: "Restaurant not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const text = buildRestaurantEmbeddingText(restaurant);
    const embedding = await ai.generateEmbedding(text);

    const { error: updateError } = await supabase
      .from("restaurants")
      .update({ embedding: `[${embedding.join(",")}]` })
      .eq("id", restaurantId);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, restaurantId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Embedding generation error:", e);
    const status = e instanceof AIError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
