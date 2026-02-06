import { Link } from "react-router-dom";
import { TrendingUp, ChevronRight, Flame } from "lucide-react";
import { useTrendingRestaurants } from "@/hooks/useTrendingRestaurants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TrendingNowSection() {
  const { data: restaurants, isLoading } = useTrendingRestaurants(4);

  if (isLoading) {
    return (
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
                <p className="text-muted-foreground text-sm">What's hot in Lahore</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl shimmer" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Trending Now</h2>
              <p className="text-muted-foreground text-sm">What's hot in Lahore</p>
            </div>
          </div>
          <Link to="/explore">
            <Button variant="ghost" className="gap-2">
              Explore more
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {restaurants.map((restaurant, index) => (
            <Link
              key={restaurant.id}
              to={`/restaurant/${restaurant.slug}`}
              className={cn(
                "group relative h-48 rounded-2xl overflow-hidden",
                "bg-card border border-border transition-all duration-300",
                "hover:shadow-lg hover:border-primary/20"
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {restaurant.cover_image ? (
                <img
                  src={restaurant.cover_image}
                  alt={restaurant.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Trending badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/90 backdrop-blur-sm">
                <Flame className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-medium text-white">Trending</span>
              </div>

              {/* Vote count */}
              {restaurant.internal_votes && restaurant.internal_votes > 0 && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm">
                  <span className="text-xs text-white">
                    {restaurant.internal_votes} votes
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-semibold text-white text-lg line-clamp-1 mb-1">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  {restaurant.neighborhood && (
                    <span>{restaurant.neighborhood}</span>
                  )}
                  {restaurant.price_range && (
                    <>
                      <span>•</span>
                      <span>{restaurant.price_range}</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
