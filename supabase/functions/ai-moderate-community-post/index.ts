import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { postId, title, content } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a content moderator for a food community platform. Analyze the post for:
- Spam (promotional content, irrelevant links)
- Toxicity (abuse, hate speech, offensive language)
- Relevance (must be food/restaurant related)
- Quality (meaningful contribution)

Return ONLY valid JSON:
{
  "score": <0-100 quality score>,
  "spam_probability": <0-100>,
  "toxicity_level": <0-100>,
  "approval_status": "approve" | "flag" | "reject",
  "moderation_notes": "<brief reason>"
}

Score >= 70 means auto-approve. Below 70 means flag for review. Below 30 means reject.`,
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${content}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      // Default to pending if AI fails
      if (postId) {
        await supabase.from("community_posts").update({ status: "pending" }).eq("id", postId);
      }
      return new Response(JSON.stringify({ status: "pending", error: "AI moderation unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const aiText = aiData.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      result = null;
    }

    if (!result) {
      result = { score: 50, spam_probability: 0, toxicity_level: 0, approval_status: "flag", moderation_notes: "Could not parse AI response" };
    }

    const status = result.approval_status === "approve" ? "approved" : result.approval_status === "reject" ? "rejected" : "pending";

    if (postId) {
      await supabase.from("community_posts").update({
        ai_moderation_score: result.score,
        ai_spam_score: result.spam_probability,
        ai_toxic_score: result.toxicity_level,
        ai_moderation_notes: result.moderation_notes,
        status,
      }).eq("id", postId);
    }

    return new Response(JSON.stringify({ ...result, status }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Moderation error:", e);
    return new Response(JSON.stringify({ error: e.message, status: "pending" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
