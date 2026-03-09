import { Link } from "react-router-dom";
import { useTrendingPosts } from "@/hooks/useCommunity";
import { MessageCircle, ArrowBigUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrendingDiscussions() {
  const { data: posts, isLoading } = useTrendingPosts(4);

  if (isLoading || !posts?.length) return null;

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Trending Food Discussions</h2>
            <p className="text-muted-foreground mt-1">Join the conversation</p>
          </div>
          <Link to="/community">
            <Button variant="ghost" size="sm" className="gap-1.5">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/community/post/${post.id}`}
              className="flex items-center gap-3 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/30 transition-colors group"
            >
              <div className="flex flex-col items-center text-muted-foreground">
                <ArrowBigUp className="w-5 h-5" />
                <span className="text-sm font-semibold">{post.votes || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {post.title}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{(post.profiles as any)?.display_name || "Anonymous"}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" /> {post.comment_count || 0}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
