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
    const { filter = "all", userId, page = 0 } = await req.json();
    const limit = 15;
    const offset = page * limit;

    // ===== STAGE 1: Database pre-filtering =====
    let restaurantQuery = supabase
      .from("restaurants")
      .select("id, name, slug, neighborhood, cuisines, price_range, average_rating, total_reviews, cover_image, tiktok_trend_score, ranking_score, is_halal, signature_dishes, description, short_description, tags, ambience, popular_dishes, created_at")
      .eq("is_active", true);

    if (filter === "trending") {
      restaurantQuery = restaurantQuery.order("tiktok_trend_score", { ascending: false });
    } else if (filter === "hot") {
      restaurantQuery = restaurantQuery.order("total_reviews", { ascending: false });
    } else if (filter === "new") {
      restaurantQuery = restaurantQuery.order("created_at", { ascending: false });
    } else {
      restaurantQuery = restaurantQuery.order("ranking_score", { ascending: false });
    }

    const { data: restaurants } = await restaurantQuery.range(offset, offset + limit - 1);

    // Fetch active deals (limit 3)
    const { data: deals } = await supabase
      .from("deals")
      .select("id, title, description, discount_value, deal_type, restaurant_id, restaurants(name, slug, cover_image)")
      .eq("is_active", true)
      .limit(3);

    // Fetch recent blog posts (limit 2)
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, cover_image, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(2);

    // Build user context if authenticated
    let userContext = "";
    if (userId) {
      const [{ data: saved }, { data: reviews }] = await Promise.all([
        supabase
          .from("saved_restaurants")
          .select("restaurant_id, restaurants(name, cuisines, neighborhood)")
          .eq("user_id", userId)
          .limit(10),
        supabase
          .from("reviews")
          .select("restaurant_id, rating, restaurants(name, cuisines)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (saved?.length) {
        userContext += `Saved: ${saved.map((s: any) => `${s.restaurants?.name} (${s.restaurants?.cuisines?.join(", ")})`).join("; ")}. `;
      }
      if (reviews?.length) {
        userContext += `Reviewed: ${reviews.map((r: any) => `${r.restaurants?.name} (${r.rating}/5)`).join("; ")}. `;
      }
    }

    // ===== STAGE 2: AI ranking on top 15 candidates only =====
    const restaurantList = (restaurants || []).map((r: any) => ({
      id: r.id, name: r.name, slug: r.slug, neighborhood: r.neighborhood,
      cuisines: r.cuisines, price_range: r.price_range,
      average_rating: r.average_rating, total_reviews: r.total_reviews,
      cover_image: r.cover_image, tiktok_trend_score: r.tiktok_trend_score,
      signature_dishes: r.signature_dishes, tags: r.tags, ambience: r.ambience,
    }));

    const dealsList = (deals || []).map((d: any) => ({
      id: d.id, title: d.title, description: d.description,
      discount_value: d.discount_value, deal_type: d.deal_type,
      restaurant_name: d.restaurants?.name, restaurant_slug: d.restaurants?.slug,
      cover_image: d.restaurants?.cover_image,
    }));

    const blogList = (blogPosts || []).map((b: any) => ({
      id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt, cover_image: b.cover_image,
    }));

    const systemPrompt = `You are a restaurant discovery AI for CityBites in Lahore, Pakistan. Rank and annotate these pre-filtered feed items. Each item needs an "aiReason" (max 8 words) and an "aiIcon" type.

Icon types: "trending", "popular", "time", "location", "preference", "new"

${userContext ? `USER CONTEXT: ${userContext}` : "Anonymous user — focus on popularity and trending."}
FILTER: "${filter}" — ${filter === "trending" ? "prioritize trending" : filter === "hot" ? "prioritize most reviewed" : filter === "new" ? "prioritize newest" : "personalized mix"}`;

    const userPrompt = `RESTAURANTS: ${JSON.stringify(restaurantList)}
DEALS: ${JSON.stringify(dealsList)}
BLOG POSTS: ${JSON.stringify(blogList)}`;

    try {
      const aiData = await ai.chatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_feed",
            description: "Return ranked discovery feed items",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      type: { type: "string", enum: ["restaurant", "deal", "editorial"] },
                      slug: { type: "string" },
                      title: { type: "string" },
                      subtitle: { type: "string" },
                      image: { type: "string" },
                      rating: { type: "number" },
                      reviewCount: { type: "number" },
                      priceRange: { type: "string" },
                      neighborhood: { type: "string" },
                      cuisines: { type: "array", items: { type: "string" } },
                      isTrending: { type: "boolean" },
                      isHot: { type: "boolean" },
                      dealText: { type: "string" },
                      aiReason: { type: "string" },
                      aiIcon: { type: "string", enum: ["trending", "popular", "time", "location", "preference", "new"] },
                    },
                    required: ["id", "type", "slug", "title", "image", "aiReason", "aiIcon"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_feed" } },
      });

      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        const feedItems = (parsed.items || []).map((item: any) => ({
          ...item,
          image: item.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
          aiContext: { reason: item.aiReason, icon: item.aiIcon },
        }));
        return new Response(JSON.stringify({ items: feedItems }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      console.error("AI ranking failed, returning DB-ranked fallback:", e);
    }

    // Fallback: return DB-ranked restaurants without AI annotations
    const fallbackItems = restaurantList.map((r: any) => ({
      id: r.id, type: "restaurant", slug: r.slug, title: r.name,
      image: r.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
      rating: r.average_rating, reviewCount: r.total_reviews,
      priceRange: r.price_range, neighborhood: r.neighborhood,
      cuisines: r.cuisines, isTrending: (r.tiktok_trend_score || 0) > 70,
      aiContext: { reason: "Popular in Lahore", icon: "popular" },
    }));

    return new Response(JSON.stringify({ items: fallbackItems }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Discovery feed error:", e);
    const status = e instanceof AIError ? e.status : 500;
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
