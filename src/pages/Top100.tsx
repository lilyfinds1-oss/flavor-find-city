import { Link } from "react-router-dom";
import { Trophy, Star, TrendingUp, MapPin, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { useTopRestaurants } from "@/hooks/useRestaurants";

export default function Top100() {
  const { data: restaurants, isLoading } = useTopRestaurants(100);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-400 to-yellow-500 text-charcoal";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-400 text-charcoal";
    if (rank === 3) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    if (rank <= 10) return "bg-gradient-primary text-primary-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-hero border-b border-border">
          <div className="container py-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/20 text-amber-dark mb-4">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Updated Weekly</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Top 100 Restaurants
              <span className="block text-primary">in Toronto</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The definitive ranking based on Google reviews, user votes, TikTok trends, and verified visits.
            </p>
          </div>
        </div>

        {/* Ranking List */}
        <div className="container py-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {restaurants?.map((restaurant, index) => {
                const rank = index + 1;
                return (
                  <Link
                    key={restaurant.id}
                    to={`/restaurant/${restaurant.slug}`}
                    className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    {/* Rank */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg ${getRankStyle(rank)}`}>
                      {rank}
                    </div>

                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={restaurant.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span>{restaurant.cuisines.slice(0, 2).join(", ")}</span>
                        <span className="text-primary font-medium">{restaurant.price_range}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {restaurant.neighborhood}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-amber font-semibold">
                          <Star className="w-4 h-4 fill-amber" />
                          {Number(restaurant.google_rating).toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">{restaurant.google_review_count} reviews</div>
                      </div>
                      {restaurant.tiktok_trend_score > 50 && (
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
