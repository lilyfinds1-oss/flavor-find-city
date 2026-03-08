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
    const { reviewId, title, content, rating, restaurantName } = await req.json();

    const aiData = await ai.chatCompletion({
      messages: [
        {
          role: "system",
          content: `You are a content moderator for a restaurant review platform. Analyze the review and return moderation scores. 
          
Score each 0-100:
- quality_score: how helpful/detailed the review is
- spam_score: likelihood it's spam (0=genuine, 100=spam)  
- toxic_score: toxicity level (0=clean, 100=very toxic)

Categories: "clean", "spam", "toxic", "low_quality", "off_topic"
Recommendation: "approve" if quality>=50 and spam<50 and toxic<30, "reject" if spam>=80 or toxic>=80, otherwise "flag"`,
        },
        {
          role: "user",
          content: `Restaurant: ${restaurantName}\nRating: ${rating}/5\nTitle: ${title || "No title"}\nReview: ${content}`,
        },
      ],
      responseSchema: {
        type: "object",
        properties: {
          quality_score: { type: "number" },
          spam_score: { type: "number" },
          toxic_score: { type: "number" },
          category: { type: "string" },
          recommendation: { type: "string" },
          notes: { type: "string" },
        },
        required: ["quality_score", "spam_score", "toxic_score", "category", "recommendation", "notes"],
      },
    });

    const result = aiData.parsed || {
      quality_score: 50, spam_score: 0, toxic_score: 0,
      category: "clean", recommendation: "flag", notes: "AI parsing failed",
    };

    if (reviewId) {
      const newStatus = result.recommendation === "approve" && result.quality_score >= 70 && result.spam_score < 30 && result.toxic_score < 20
        ? "approved"
        : result.recommendation === "reject"
        ? "rejected"
        : "pending";

      await supabase.from("reviews").update({
        status: newStatus,
        ai_quality_score: Math.round(result.quality_score),
        ai_spam_score: Math.round(result.spam_score),
        ai_toxic_score: Math.round(result.toxic_score),
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
      recommendation: "flag", quality_score: 0, spam_score: 0, toxic_score: 0,
      category: "clean", notes: "Error during moderation — flagged for manual review",
    }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
