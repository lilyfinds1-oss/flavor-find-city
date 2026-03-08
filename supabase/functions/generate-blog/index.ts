import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAIProvider, AIError } from "../_shared/ai-provider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEARCH_TOPICS = [
  "best steak restaurants in Lahore",
  "top biryani places in Lahore",
  "best BBQ in Lahore",
  "best pizza in Lahore",
  "best cafes in Lahore",
  "best fine dining restaurants in Lahore",
  "best Chinese food in Lahore",
  "best dessert places in Lahore",
  "best burger joints in Lahore",
  "best breakfast spots in Lahore",
  "best desi food in Lahore",
  "best seafood restaurants in Lahore",
  "best rooftop restaurants in Lahore",
  "best ice cream in Lahore",
  "best nihari in Lahore",
  "best haleem spots in Lahore",
  "best street food in Lahore",
  "best family restaurants in Lahore",
  "best date night restaurants Lahore",
  "best budget friendly food Lahore",
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const ai = await createAIProvider();
    const topic = SEARCH_TOPICS[Math.floor(Math.random() * SEARCH_TOPICS.length)];
    console.log("Generating blog for topic:", topic);

    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("name, slug, address, neighborhood, cuisines, average_rating, google_rating, google_review_count, description, short_description, signature_dishes, popular_dishes, price_range, cover_image, is_halal, has_delivery, ambience, tags")
      .eq("is_active", true)
      .order("ranking_score", { ascending: false })
      .limit(10);

    const restaurantContext = (restaurants || [])
      .map(
        (r: any, i: number) =>
          `${i + 1}. ${r.name} — ${r.neighborhood || "Lahore"}, Rating: ${r.google_rating || r.average_rating}/5 (${r.google_review_count || 0} reviews), Price: ${r.price_range}, Cuisines: ${(r.cuisines || []).join(", ")}, Signature Dishes: ${(r.signature_dishes || []).join(", ")}, Popular Dishes: ${(r.popular_dishes || []).join(", ")}, Ambience: ${r.ambience || "N/A"}, Tags: ${(r.tags || []).join(", ")}, Halal: ${r.is_halal ? "Yes" : "No"}, Delivery: ${r.has_delivery ? "Yes" : "No"}${r.short_description ? `, About: ${r.short_description}` : r.description ? `, About: ${r.description.slice(0, 150)}` : ""}`
      )
      .join("\n");

    const aiData = await ai.chatCompletion({
      temperature: 0.8,
      messages: [
        {
          role: "system",
          content: `You are a food blogger for CityBites, an AI-powered restaurant discovery platform in Lahore, Pakistan. Write engaging, SEO-optimized blog posts. Your style: Conversational, enthusiastic, helpful. Use Pakistani food terminology naturally. Include practical info (prices, areas, best dishes, ambience).`,
        },
        {
          role: "user",
          content: `Write about: "${topic}"\n\nRestaurant data:\n${restaurantContext || "No specific restaurants found, write general recommendations."}\n\nRequirements:\n- SEO-optimized for "${topic}"\n- 5-7 restaurants with reviews including ambience, must-try dishes, price range\n- End with CTA to explore CityBites\n- Markdown formatting`,
        },
      ],
      responseSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
          excerpt: { type: "string" },
          content: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["title", "excerpt", "content", "tags"],
      },
    });

    const result = aiData.parsed;
    if (!result?.title) throw new Error("AI failed to generate blog post");

    const slug = slugify(result.title) + "-" + Date.now().toString(36);

    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!adminRole) throw new Error("No admin user found to author the post");

    const coverImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop";

    const { data: post, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title: result.title, slug, excerpt: result.excerpt || null, content: result.content,
        tags: result.tags || [], cover_image: coverImage,
        author_id: adminRole.user_id,
        status: "published", published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    console.log("Blog post created:", post.id, result.title);
    return new Response(JSON.stringify({ success: true, post: { id: post.id, title: result.title, slug } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating blog:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof AIError ? error.status : 500;
    return new Response(JSON.stringify({ success: false, error: message }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
