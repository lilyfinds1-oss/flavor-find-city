import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { CommunityCategories } from "@/components/community/CommunityCategories";
import { TrendingTopics } from "@/components/community/TrendingTopics";
import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { useCommunityPosts } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/contexts/CityContext";
import { Plus, TrendingUp, Clock, Sparkles } from "lucide-react";

export default function Community() {
  const [categorySlug, setCategorySlug] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"trending" | "latest">("trending");
  const { data: posts, isLoading } = useCommunityPosts(categorySlug);
  const { user } = useAuth();
  const { city } = useCity();

  const sortedPosts = posts ? [...posts].sort((a, b) => {
    if (sortBy === "trending") return (b.votes || 0) - (a.votes || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }) : [];

  return (
    <PageTransition>
      <SEOHead
        title={`Food Community - ${city?.name || "CityBites"}`}
        description="Join food discussions, share hidden gems, ask for recommendations, and connect with fellow foodies."
      />
      <Header />
      <main className="container py-8 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground mt-1">Discuss food, share gems, get recommendations</p>
          </div>
          {user && (
            <Link to="/community/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> New Post
              </Button>
            </Link>
          )}
        </div>

        <CommunityCategories selected={categorySlug} onSelect={setCategorySlug} />

        <div className="flex items-center gap-2 mt-4 mb-6">
          <Button
            variant={sortBy === "trending" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("trending")}
            className="gap-1.5"
          >
            <TrendingUp className="w-4 h-4" /> Trending
          </Button>
          <Button
            variant={sortBy === "latest" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSortBy("latest")}
            className="gap-1.5"
          >
            <Clock className="w-4 h-4" /> Latest
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 rounded-2xl shimmer" />
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No posts yet</h3>
            <p className="text-muted-foreground mt-1">Be the first to start a discussion!</p>
            {user && (
              <Link to="/community/create">
                <Button className="mt-4 gap-2"><Plus className="w-4 h-4" /> Create Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPosts.map((post) => (
              <CommunityPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </PageTransition>
  );
}
