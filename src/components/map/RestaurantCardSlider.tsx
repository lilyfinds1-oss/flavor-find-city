import { Link } from "react-router-dom";
import { Star, MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Restaurant } from "@/hooks/useRestaurants";

interface RestaurantCardSliderProps {
  restaurants: Restaurant[];
  selectedId?: string;
  onSelect?: (restaurant: Restaurant) => void;
}

export function RestaurantCardSlider({
  restaurants,
  selectedId,
  onSelect,
}: RestaurantCardSliderProps) {
  if (restaurants.length === 0) return null;

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar">
      {restaurants.map((restaurant) => (
        <div
          key={restaurant.id}
          onClick={() => onSelect?.(restaurant)}
          className={`flex-shrink-0 w-72 snap-start cursor-pointer transition-all ${
            selectedId === restaurant.id ? "ring-2 ring-primary rounded-xl" : ""
          }`}
        >
          <Link to={`/restaurant/${restaurant.slug}`}>
            <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-24 relative">
                <img
                  src={
                    restaurant.cover_image ||
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=150&fit=crop"
                  }
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge className="bg-success text-success-foreground text-xs">
                    Open
                  </Badge>
                  {restaurant.tiktok_trend_score >= 50 && (
                    <Badge className="bg-amber text-charcoal text-xs">
                      🔥 Trending
                    </Badge>
                  )}
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {restaurant.cuisines.slice(0, 2).join(" • ")} •{" "}
                      {restaurant.price_range}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber/20 rounded px-1.5 py-0.5">
                    <Star className="w-3 h-3 text-amber fill-amber" />
                    <span className="text-sm font-semibold">
                      {Number(restaurant.google_rating).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {restaurant.neighborhood || "Lahore"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (restaurant.latitude && restaurant.longitude) {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`,
                          "_blank"
                        );
                      }
                    }}
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </Button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
