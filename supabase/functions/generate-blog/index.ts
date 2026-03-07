import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Trending food search topics for Lahore
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
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Pick a random topic
    const topic = SEARCH_TOPICS[Math.floor(Math.random() * SEARCH_TOPICS.length)];
    console.log("Generating blog for topic:", topic);

    // Fetch matching restaurants from our database
    const keywords = topic
      .replace(/best |top |in lahore/gi, "")
      .trim()
      .split(" ")
      .filter((w) => w.length > 2);

    let query = supabase
      .from("restaurants")
      .select("name, slug, address, neighborhood, cuisines, average_rating, google_rating, google_review_count, description, signature_dishes, price_range, cover_image, is_halal, has_delivery")
      .eq("is_active", true)
      .order("ranking_score", { ascending: false })
      .limit(20);

    const { data: restaurants } = await query;

    // Build a context string about our restaurants
    const restaurantContext = (restaurants || [])
      .slice(0, 10)
      .map(
        (r, i) =>
          `${i + 1}. ${r.name} — ${r.neighborhood || "Lahore"}, Rating: ${r.google_rating || r.average_rating}/5 (${r.google_review_count || 0} reviews), Price: ${r.price_range}, Cuisines: ${(r.cuisines || []).join(", ")}, Signature: ${(r.signature_dishes || []).join(", ")}, Halal: ${r.is_halal ? "Yes" : "No"}${r.description ? `, About: ${r.description.slice(0, 100)}` : ""}`
      )
      .join("\n");

    // Generate blog content using AI
    const aiResponse = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a food blogger for CityBites, an AI-powered restaurant discovery platform in Lahore, Pakistan. Write engaging, SEO-optimized blog posts about food in Lahore.

Your writing style: Conversational, enthusiastic, helpful. Use Pakistani food terminology naturally. Include practical info (prices, areas, best dishes).

Always respond with valid JSON in this exact format:
{
  "title": "SEO-friendly title under 60 chars",
  "excerpt": "Compelling meta description under 155 chars",
  "content": "Full blog post in markdown with H2/H3 headings, paragraphs, bold text. 800-1200 words. Include intro, numbered restaurant list with descriptions, and conclusion.",
  "tags": ["tag1", "tag2", "tag3"],
  "cover_image_query": "unsplash search query for cover image"
}`,
          },
          {
            role: "user",
            content: `Write a blog post about: "${topic}"

Here are some top restaurants from our database for reference (use these in your article where relevant):
${restaurantContext || "No specific restaurants found, write general recommendations."}

Requirements:
- Title should be SEO-optimized for the search query "${topic}"
- List 5-7 restaurants with brief reviews
- Include practical details (location, price range, must-try dishes)
- End with a CTA to explore more on CityBites
- Use markdown formatting with ## for headings`,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API failed: ${aiResponse.status} - ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("No content from AI");
    }

    // Parse the JSON response
    let blogData;
    try {
      // Strip markdown code blocks if present
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      blogData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    const { title, excerpt, content, tags } = blogData;

    if (!title || !content) {
      throw new Error("Missing title or content from AI response");
    }

    // Generate slug
    const slug = slugify(title) + "-" + Date.now().toString(36);

    // Find or create an admin author
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .single();

    if (!adminRole) {
      throw new Error("No admin user found to author the post");
    }

    // Pick a cover image from Unsplash
    const coverImage = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=630&fit=crop`;

    // Insert the blog post
    const { data: post, error: insertError } = await supabase
      .from("blog_posts")
      .insert({
        title,
        slug,
        excerpt: excerpt || null,
        content,
        tags: tags || [],
        cover_image: coverImage,
        author_id: adminRole.user_id,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log("Blog post created:", post.id, title);

    return new Response(
      JSON.stringify({
        success: true,
        post: { id: post.id, title, slug },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating blog:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
