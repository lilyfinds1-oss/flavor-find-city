import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all subscribed newsletter users
    const { data: subscribers, error: subError } = await supabase
      .from("newsletter_subscribers")
      .select("email, user_id")
      .eq("is_subscribed", true);

    if (subError) throw subError;

    // Get trending restaurants this week
    const { data: trending } = await supabase
      .from("restaurants")
      .select("name, slug, city_rank, google_rating")
      .eq("is_active", true)
      .order("ranking_score", { ascending: false })
      .limit(5);

    // Get recent reviews count
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: reviewCount } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .gte("created_at", oneWeekAgo);

    // Get active deals count
    const { count: dealCount } = await supabase
      .from("deals")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Create digest notification for each subscribed user who has a user_id
    const notifications = (subscribers || [])
      .filter((s: any) => s.user_id)
      .map((s: any) => ({
        user_id: s.user_id,
        type: "weekly_digest",
        title: "🍽️ Your Weekly CityBites Digest",
        message: `${reviewCount || 0} new reviews, ${dealCount || 0} active deals, and ${trending?.length || 0} trending spots this week!`,
        link: "/explore",
      }));

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        subscribers_notified: notifications.length,
        trending_count: trending?.length || 0,
        review_count: reviewCount || 0,
        deal_count: dealCount || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Weekly digest error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
