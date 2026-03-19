import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export function useCommunityCategories() {
  return useQuery({
    queryKey: ["community-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_categories")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCommunityPosts(categorySlug?: string) {
  return useQuery({
    queryKey: ["community-posts", categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("community_posts")
        .select(`*, community_categories(*), restaurants(id, name, slug, cover_image), profiles!community_posts_user_id_fkey(display_name, username, avatar_url)`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (categorySlug) {
        const { data: cat } = await supabase
          .from("community_categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useTrendingPosts(limit = 5) {
  return useQuery({
    queryKey: ["community-trending", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select(`*, community_categories(*)`)
        .eq("status", "approved")
        .order("votes", { ascending: false })
        .order("comment_count", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useCommunityPost(postId: string) {
  return useQuery({
    queryKey: ["community-post", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select(`*, community_categories(*), restaurants(id, name, slug, cover_image, neighborhood, cuisines)`)
        .eq("id", postId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });
}

export function useCommunityComments(postId: string) {
  return useQuery({
    queryKey: ["community-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_comments")
        .select(`*`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: {
      title: string;
      content: string;
      category_id: string;
      restaurant_id?: string;
      dish_tag?: string;
      image_url?: string;
      user_id: string;
    }) => {
      const { data, error } = await supabase
        .from("community_posts")
        .insert(post)
        .select()
        .single();
      if (error) throw error;

      // Trigger AI moderation async
      supabase.functions.invoke("ai-moderate-community-post", {
        body: { postId: data.id, title: post.title, content: post.content },
      }).catch(console.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      toast({ title: "Post created!", description: "Your post is being reviewed and will appear shortly." });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: { post_id: string; user_id: string; content: string; parent_id?: string }) => {
      const { data, error } = await supabase
        .from("community_comments")
        .insert(comment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community-comments", vars.post_id] });
      queryClient.invalidateQueries({ queryKey: ["community-post", vars.post_id] });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });
}

export function useVotePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, voteType }: { postId: string; voteType: "upvote" | "downvote" }) => {
      if (!user) throw new Error("Must be logged in");

      // Check existing vote
      const { data: existing } = await supabase
        .from("community_votes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        if (existing.vote_type === voteType) {
          // Remove vote
          const { error } = await supabase.from("community_votes").delete().eq("id", existing.id);
          if (error) throw error;
          return { action: "removed" };
        } else {
          // Change vote
          const { error } = await supabase.from("community_votes").update({ vote_type: voteType }).eq("id", existing.id);
          if (error) throw error;
          return { action: "changed" };
        }
      } else {
        // New vote
        const { error } = await supabase.from("community_votes").insert({ post_id: postId, user_id: user.id, vote_type: voteType });
        if (error) throw error;
        return { action: "voted" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      queryClient.invalidateQueries({ queryKey: ["community-trending"] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const { error } = await supabase.from("community_comments").delete().eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["community-comments", vars.postId] });
      queryClient.invalidateQueries({ queryKey: ["community-post", vars.postId] });
    },
  });
}
