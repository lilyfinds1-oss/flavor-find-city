import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommunityComments } from "@/components/community/CommunityComments";
import { useCommunityPost, useVotePost } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, ArrowBigUp, ArrowBigDown, Store, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function CommunityPostDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading } = useCommunityPost(id!);
  const { user } = useAuth();
  const voteMutation = useVotePost();

  if (isLoading) {
    return (
      <PageTransition>
        <Header />
        <main className="container py-8 max-w-3xl min-h-screen">
          <div className="h-8 w-48 shimmer rounded-xl mb-4" />
          <div className="h-64 shimmer rounded-2xl" />
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (!post) {
    return (
      <PageTransition>
        <Header />
        <main className="container py-16 text-center min-h-screen">
          <h2 className="text-xl font-semibold text-foreground">Post not found</h2>
          <Link to="/community" className="text-primary hover:underline mt-2 block">Back to Community</Link>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const profile = post.profiles as any;
  const category = post.community_categories as any;
  const restaurant = post.restaurants as any;

  return (
    <PageTransition>
      <SEOHead title={`${post.title} - Community`} description={post.content.substring(0, 160)} />
      <Header />
      <main className="container py-8 max-w-3xl min-h-screen">
        <Link to="/community" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>

        <article className="bg-card border border-border/50 rounded-2xl p-6">
          <div className="flex gap-4">
            {/* Votes */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => user && voteMutation.mutate({ postId: post.id, voteType: "upvote" })}
                className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowBigUp className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold text-foreground">{post.votes || 0}</span>
              <button
                onClick={() => user && voteMutation.mutate({ postId: post.id, voteType: "downvote" })}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <ArrowBigDown className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {category && <Badge variant="secondary">{category.name}</Badge>}
                {post.dish_tag && <Badge variant="outline">🍽️ {post.dish_tag}</Badge>}
              </div>

              <h1 className="text-2xl font-display font-bold text-foreground mb-2">{post.title}</h1>

              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-[10px] bg-muted">{profile?.display_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <span>{profile?.display_name || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="prose prose-sm text-foreground/90 max-w-none whitespace-pre-wrap">
                {post.content}
              </div>

              {post.image_url && (
                <img src={post.image_url} alt="" className="mt-4 rounded-xl max-h-96 object-cover w-full" />
              )}

              {restaurant && (
                <Link
                  to={`/restaurant/${restaurant.slug}`}
                  className="flex items-center gap-3 mt-4 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  {restaurant.cover_image && (
                    <img src={restaurant.cover_image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Store className="w-3.5 h-3.5 text-primary" />
                      {restaurant.name}
                    </div>
                    {restaurant.neighborhood && (
                      <span className="text-xs text-muted-foreground">{restaurant.neighborhood}</span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          </div>
        </article>

        <div className="mt-6">
          <CommunityComments postId={post.id} />
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
