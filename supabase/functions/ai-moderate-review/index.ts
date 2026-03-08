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
    const ai = await createAIProvider();
    const { reviewId, title, content, rating, restaurantName } = await req.json();

    const aiData = await ai.chatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a content moderation AI for a restaurant review platform. Evaluate the review across three separate dimensions:

1. **Spam Detection** (spam_score 0-100): Promotional content, irrelevant text, repetitive patterns, fake reviews, link spam.
2. **Toxicity Detection** (toxic_score 0-100): Hate speech, profanity, personal attacks, threats, discriminatory language.
3. **Quality Assessment** (quality_score 0-100): Helpfulness, detail, relevance to the restaurant, constructive feedback.

Provide a category classification and recommendation:
- "clean" = passes all checks
- "spam" = spam detected
- "toxic" = toxic content detected
- "low_quality" = low quality review
- "multi_issue" = multiple problems

Recommendation: "approve" (quality >= 70, spam < 30, toxic < 20), "flag" (needs manual review), "reject" (clearly spam/toxic)`,
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
          description: "Return detailed moderation results",
          parameters: {
            type: "object",
            properties: {
              recommendation: { type: "string", enum: ["approve", "flag", "reject"] },
              quality_score: { type: "integer", minimum: 0, maximum: 100 },
              spam_score: { type: "integer", minimum: 0, maximum: 100 },
              toxic_score: { type: "integer", minimum: 0, maximum: 100 },
              category: { type: "string", enum: ["clean", "spam", "toxic", "low_quality", "multi_issue"] },
              notes: { type: "string", description: "Brief explanation of the moderation decision" },
            },
            required: ["recommendation", "quality_score", "spam_score", "toxic_score", "category", "notes"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "moderate_review" } },
    });

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let result = {
      recommendation: "flag" as string,
      quality_score: 0,
      spam_score: 0,
      toxic_score: 0,
      category: "clean" as string,
      notes: "Could not parse AI response",
    };

    if (toolCall?.function?.arguments) {
      result = JSON.parse(toolCall.function.arguments);
    }

    // Update review in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (reviewId && supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const newStatus = result.recommendation === "approve" && result.quality_score >= 70 && result.spam_score < 30 && result.toxic_score < 20
        ? "approved"
        : result.recommendation === "reject"
        ? "rejected"
        : "pending";

      await supabase.from("reviews").update({
        status: newStatus,
        ai_quality_score: result.quality_score,
        ai_spam_score: result.spam_score,
        ai_toxic_score: result.toxic_score,
        ai_moderation_category: result.category,
        ai_moderation_notes: result.notes,
      }).eq("id", reviewId);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Moderation error:", e);
    const status = e instanceof AIError ? e.status : 500;
    return new Response(JSON.stringify({
      recommendation: "flag",
      quality_score: 0,
      spam_score: 0,
      toxic_score: 0,
      category: "clean",
      notes: "Error during moderation — flagged for manual review",
    }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
