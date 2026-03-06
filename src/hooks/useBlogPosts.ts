import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[];
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useBlogPosts(limit = 12) {
  return useQuery({
    queryKey: ["blog-posts", limit],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set((posts || []).map((p: any) => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", authorIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      return (posts || []).map((post: any) => ({
        ...post,
        profile: profileMap.get(post.author_id) || null,
      })) as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data: post, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) throw error;
      if (!post) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", (post as any).author_id)
        .maybeSingle();

      return { ...post, profile } as BlogPost;
    },
    enabled: !!slug,
  });
}
