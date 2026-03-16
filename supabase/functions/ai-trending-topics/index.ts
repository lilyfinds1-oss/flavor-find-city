import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch recent approved posts from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: posts, error } = await supabase
      .from("community_posts")
      .select("title, content, dish_tag, votes, comment_count, community_categories(name)")
      .eq("status", "approved")
      .gte("created_at", sevenDaysAgo)
      .order("votes", { ascending: false })
      .limit(50);

    if (error) throw error;

    if (!posts || posts.length < 3) {
      return new Response(JSON.stringify({ topics: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const postsSummary = posts.map((p, i) => 
      `${i + 1}. "${p.title}" (${p.votes || 0} votes, ${p.comment_count || 0} comments)${p.dish_tag ? ` [dish: ${p.dish_tag}]` : ""}${(p.community_categories as any)?.name ? ` [cat: ${(p.community_categories as any).name}]` : ""}: ${p.content.substring(0, 150)}`
    ).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are a food community analyst. Analyze community posts and identify trending topics/themes. Return structured data via the provided tool."
          },
          {
            role: "user",
            content: `Analyze these recent community posts and identify 3-5 trending food discussion topics:\n\n${postsSummary}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_trending_topics",
            description: "Report the identified trending food discussion topics.",
            parameters: {
              type: "object",
              properties: {
                topics: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Short topic title (3-6 words)" },
                      description: { type: "string", description: "One sentence describing the trend" },
                      emoji: { type: "string", description: "Single relevant emoji" },
                      heat: { type: "string", enum: ["hot", "warm", "rising"], description: "How trending this topic is" },
                      post_count: { type: "integer", description: "Approximate number of related posts" }
                    },
                    required: ["title", "description", "emoji", "heat", "post_count"],
                    additionalProperties: false
                  }
                }
              },
              required: ["topics"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "report_trending_topics" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    let topics = [];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        topics = parsed.topics || [];
      } catch {
        topics = [];
      }
    }

    return new Response(JSON.stringify({ topics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Trending topics error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
