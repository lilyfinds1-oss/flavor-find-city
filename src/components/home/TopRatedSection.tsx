import { Link } from "react-router-dom";
import { Star, ChevronRight, Award } from "lucide-react";
import { useTopRatedRestaurants } from "@/hooks/useTopRatedRestaurants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopRatedSection() {
  const { data: restaurants, isLoading } = useTopRatedRestaurants(6);

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Top Rated</h2>
                <p className="text-muted-foreground text-sm">Lahore's highest-rated spots</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl shimmer" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Top Rated</h2>
              <p className="text-muted-foreground text-sm">Lahore's highest-rated spots</p>
            </div>
          </div>
          <Link to="/top-100">
            <Button variant="ghost" className="gap-2">
              See all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {restaurants.map((restaurant, index) => (
            <Link
              key={restaurant.id}
              to={`/restaurant/${restaurant.slug}`}
              className={cn(
                "group relative aspect-[3/4] rounded-2xl overflow-hidden",
                "bg-card border border-border transition-all duration-300",
                "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {restaurant.cover_image ? (
                <img
                  src={restaurant.cover_image}
                  alt={restaurant.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Rank badge */}
              <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-white/90 text-xs font-medium">
                    {restaurant.average_rating?.toFixed(1) || "New"}
                  </span>
                  {restaurant.total_reviews && restaurant.total_reviews > 0 && (
                    <span className="text-white/60 text-xs">
                      ({restaurant.total_reviews})
                    </span>
                  )}
                </div>
                {restaurant.neighborhood && (
                  <p className="text-white/60 text-xs mt-1 line-clamp-1">
                    {restaurant.neighborhood}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
