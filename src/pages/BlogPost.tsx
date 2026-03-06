import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Article not found</h1>
            <Link to="/blog"><Button>Browse Articles</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`${post.title} — CityBites Blog`}
        description={post.excerpt || post.content.slice(0, 160)}
        image={post.cover_image || undefined}
        type="article"
      />
      <Header />
      <PageTransition>
        <main className="flex-1">
          {post.cover_image && (
            <div className="relative h-64 md:h-96">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <Link to="/blog" className="absolute top-4 left-4">
                <Button variant="glass" size="icon"><ChevronLeft className="w-5 h-5" /></Button>
              </Link>
            </div>
          )}

          <article className="container max-w-3xl py-10">
            {!post.cover_image && (
              <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ChevronLeft className="w-4 h-4" /> Back to Blog
              </Link>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}

            <h1 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/30">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.profile?.avatar_url || undefined} />
                <AvatarFallback>{post.profile?.display_name?.charAt(0) || "A"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{post.profile?.display_name || "CityBites"}</p>
                {post.published_at && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.published_at), "MMMM d, yyyy")}
                  </p>
                )}
              </div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {post.content}
            </div>
          </article>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
