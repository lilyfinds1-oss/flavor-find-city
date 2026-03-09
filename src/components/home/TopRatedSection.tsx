import { Link } from "react-router-dom";
import { Star, ChevronRight, Award } from "lucide-react";
import { useTopRatedRestaurants } from "@/hooks/useTopRatedRestaurants";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCity } from "@/contexts/CityContext";

export function TopRatedSection() {
  const { city } = useCity();
  const { data: restaurants, isLoading } = useTopRatedRestaurants(6);

  if (isLoading) {
    return (
      <section className="py-10 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Top Rated</h2>
                <p className="text-muted-foreground text-xs sm:text-sm">{city?.name || "Your city"}'s highest-rated spots</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
    <section className="py-10 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Top Rated</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">{city?.name || "Your city"}'s highest-rated spots</p>
            </div>
          </div>
          <Link to="/top-100">
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              See all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-muted" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-2 left-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] sm:text-xs font-bold">
                {index + 1}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                <h3 className="font-semibold text-white text-xs sm:text-sm line-clamp-1 mb-0.5 sm:mb-1">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-white/90 text-[10px] sm:text-xs font-medium">
                    {restaurant.average_rating?.toFixed(1) || "New"}
                  </span>
                  {restaurant.total_reviews && restaurant.total_reviews > 0 && (
                    <span className="text-white/60 text-[10px] sm:text-xs hidden sm:inline">
                      ({restaurant.total_reviews})
                    </span>
                  )}
                </div>
                {restaurant.neighborhood && (
                  <p className="text-white/60 text-[10px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-1">
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
