import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { reviewId, title, content, rating, restaurantName } = await req.json();

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
            content: `You are a content moderation AI for a restaurant review platform. Evaluate the following review for:
1. Spam detection (promotional content, irrelevant text, repetitive patterns)
2. Inappropriate content (hate speech, profanity, personal attacks)
3. Quality assessment (helpfulness, detail, relevance to the restaurant)

Provide a quality score from 1-100 and a recommendation. Score >= 70 means auto-approve. Score < 70 means flag for manual review.`,
          },
          {
            role: "user",
            content: `Restaurant: ${restaurantName}\nRating: ${rating}/5\nTitle: ${title || "No title"}\nReview: ${content}`,
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "moderate_review",
            description: "Return moderation results for the review",
            parameters: {
              type: "object",
              properties: {
                recommendation: { type: "string", enum: ["approve", "flag", "reject"] },
                quality_score: { type: "integer", minimum: 1, maximum: 100 },
                notes: { type: "string", description: "Brief explanation of the moderation decision" },
              },
              required: ["recommendation", "quality_score", "notes"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "moderate_review" } },
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
      console.error("AI moderation error:", response.status, errText);
      // On AI failure, leave as pending for manual review
      return new Response(JSON.stringify({
        recommendation: "flag",
        quality_score: 0,
        notes: "AI moderation unavailable - flagged for manual review",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({
        recommendation: "flag",
        quality_score: 0,
        notes: "Could not parse AI response",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = JSON.parse(toolCall.function.arguments);

    // Auto-update review in database if we have the service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (reviewId && supabaseUrl && supabaseServiceKey) {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const newStatus = result.recommendation === "approve" && result.quality_score >= 70
        ? "approved"
        : result.recommendation === "reject"
        ? "rejected"
        : "pending";

      await supabase.from("reviews").update({
        status: newStatus,
        ai_quality_score: result.quality_score,
        ai_moderation_notes: result.notes,
      }).eq("id", reviewId);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Moderation error:", e);
    return new Response(JSON.stringify({
      recommendation: "flag",
      quality_score: 0,
      notes: "Error during moderation",
    }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
