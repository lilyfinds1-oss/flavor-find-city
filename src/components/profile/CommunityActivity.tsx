import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ArrowBigUp, MessageCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

function useUserCommunityActivity(userId: string | undefined) {
  const posts = useQuery({
    queryKey: ["user-community-posts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("id, title, votes, comment_count, status, created_at, community_categories(name, slug)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const comments = useQuery({
    queryKey: ["user-community-comments", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_comments")
        .select("id, content, created_at, post_id, community_posts(id, title)")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  return { posts, comments };
}

export function CommunityActivity() {
  const { user } = useAuth();
  const { posts, comments } = useUserCommunityActivity(user?.id);

  const totalUpvotes = posts.data?.reduce((sum, p) => sum + (p.votes || 0), 0) || 0;
  const totalPosts = posts.data?.length || 0;
  const totalComments = comments.data?.length || 0;

  return (
    <Card className="md:col-span-3">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Community Activity
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Your posts, comments, and engagement
        </CardDescription>
        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">{totalPosts}</span> posts
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">{totalComments}</span> comments
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowBigUp className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground">{totalUpvotes}</span> upvotes received
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1 text-xs">My Posts</TabsTrigger>
            <TabsTrigger value="comments" className="flex-1 text-xs">My Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-3 space-y-2">
            {posts.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !posts.data?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No posts yet.{" "}
                <Link to="/community/create" className="text-primary hover:underline">
                  Start a discussion!
                </Link>
              </p>
            ) : (
              posts.data.map((post) => (
                <Link
                  key={post.id}
                  to={`/community/post/${post.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors"
                >
                  <div className="flex flex-col items-center min-w-[40px]">
                    <ArrowBigUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-bold">{post.votes || 0}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-1">{post.title}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {post.community_categories && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {(post.community_categories as any).name}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at!), { addSuffix: true })}
                      </span>
                      {post.status === "pending" && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Pending</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.comment_count || 0}
                  </div>
                </Link>
              ))
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-3 space-y-2">
            {comments.isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : !comments.data?.length ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No comments yet.{" "}
                <Link to="/community" className="text-primary hover:underline">
                  Join a discussion!
                </Link>
              </p>
            ) : (
              comments.data.map((comment) => (
                <Link
                  key={comment.id}
                  to={`/community/post/${comment.post_id}`}
                  className="block p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors"
                >
                  <p className="text-sm line-clamp-2">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      on "{(comment.community_posts as any)?.title || "a post"}"
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at!), { addSuffix: true })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
