import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, restaurants } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build restaurant context for the AI
    const restaurantContext = restaurants?.length > 0 
      ? `\n\nAvailable restaurants in Toronto:\n${restaurants.map((r: any) => 
          `- ${r.name} (${r.slug}): ${r.cuisines?.join(", ")} cuisine, ${r.price_range} price range, ${r.neighborhood} area, ${r.google_rating} rating${r.is_halal ? ", Halal" : ""}${r.has_delivery ? ", Delivery available" : ""}`
        ).join("\n")}`
      : "";

    const systemPrompt = `You are a friendly and knowledgeable food assistant for CityBites, a restaurant discovery app in Toronto. Your job is to help users find the perfect restaurant based on their preferences.

When recommending restaurants, consider:
- Budget/price range ($, $$, $$$, $$$$)
- Cuisine preferences (Indian, Pakistani, Japanese, Italian, BBQ, etc.)
- Dietary requirements (halal, vegetarian, vegan)
- Location/neighborhood preferences
- Mood and occasion (date night, family dinner, quick lunch, etc.)
- Features (delivery, outdoor seating, reservations)

Always be enthusiastic about food and provide helpful, personalized recommendations. When you suggest restaurants, format them clearly with the restaurant name, cuisine type, price range, and why it's a good match.

IMPORTANT: When suggesting restaurants, you MUST include them in a structured format at the end of your response using this exact JSON format wrapped in <suggestions> tags:
<suggestions>
[{"name": "Restaurant Name", "slug": "restaurant-slug", "cuisine": "Cuisine Type", "price": "$$", "match": "95% match"}]
</suggestions>

Only include restaurants that exist in the available restaurants list. Match the slug exactly.
${restaurantContext}`;

    console.log("Sending request to Lovable AI with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request.";
    
    // Parse suggestions from the response
    let suggestions: any[] = [];
    const suggestionsMatch = content.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
    if (suggestionsMatch) {
      try {
        suggestions = JSON.parse(suggestionsMatch[1].trim());
      } catch (e) {
        console.error("Failed to parse suggestions:", e);
      }
    }

    // Clean the content by removing the suggestions tags
    const cleanContent = content.replace(/<suggestions>[\s\S]*?<\/suggestions>/, "").trim();

    console.log("AI response received, suggestions:", suggestions.length);

    return new Response(
      JSON.stringify({ content: cleanContent, suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Food assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
