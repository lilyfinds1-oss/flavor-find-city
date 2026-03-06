import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Blog() {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Blog — CityBites"
        description="Food guides, restaurant spotlights, and culinary stories from the CityBites community."
      />
      <Header />
      <PageTransition>
        <main className="flex-1 container py-10">
          <div className="max-w-4xl mx-auto mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
              The <span className="gradient-text">CityBites</span> Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Food guides, neighborhood spotlights, and culinary stories.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  {post.cover_image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={post.profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {post.profile?.display_name?.charAt(0) || "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {post.profile?.display_name || "CityBites"}
                        </span>
                      </div>
                      {post.published_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-20">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">
                Our food guides and articles are on the way. Check back soon!
              </p>
            </div>
          )}
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
