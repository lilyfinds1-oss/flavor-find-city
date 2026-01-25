import { useState } from "react";
import { MapPin, Filter, Star, Navigation, List, Map as MapIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRestaurants } from "@/hooks/useRestaurants";

export default function MapPage() {
  const [showList, setShowList] = useState(false);
  const { data: restaurants } = useRestaurants({ limit: 20 });

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 relative">
        {/* Map Placeholder */}
        <div className="absolute inset-0 bg-muted">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-primary mx-auto mb-4 animate-bounce" />
              <h2 className="font-display text-2xl font-bold mb-2">Interactive Map Coming Soon</h2>
              <p className="text-muted-foreground mb-4">
                Explore restaurants near you with our interactive map
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                📍 Toronto, ON
              </Badge>
            </div>
          </div>
          
          {/* Simulated map markers */}
          <div className="absolute top-1/4 left-1/3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg map-marker">
              1
            </div>
          </div>
          <div className="absolute top-1/3 right-1/4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg map-marker" style={{ animationDelay: "100ms" }}>
              2
            </div>
          </div>
          <div className="absolute bottom-1/3 left-1/2">
            <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center text-charcoal text-sm font-bold shadow-lg map-marker" style={{ animationDelay: "200ms" }}>
              3
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <Button variant="glass" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button variant="glass" size="sm">Open Now</Button>
            <Button variant="glass" size="sm">$$</Button>
            <Button variant="glass" size="sm">Halal</Button>
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowList(!showList)}
            className="gap-2 pointer-events-auto"
          >
            {showList ? <MapIcon className="w-4 h-4" /> : <List className="w-4 h-4" />}
            {showList ? "Map" : "List"}
          </Button>
        </div>

        {/* Trending Near You Banner */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <Badge className="bg-gradient-primary text-primary-foreground px-4 py-2 text-sm shadow-lg">
            🔥 15 Trending Near You
          </Badge>
        </div>

        {/* Bottom Restaurant Cards */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory custom-scrollbar">
            {restaurants?.slice(0, 5).map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurant/${restaurant.slug}`}
                className="flex-shrink-0 w-72 snap-start"
              >
                <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-24 relative">
                    <img
                      src={restaurant.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=150&fit=crop"}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-success text-success-foreground text-xs">Open</Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display font-semibold line-clamp-1">{restaurant.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {restaurant.cuisines.slice(0, 2).join(" • ")} • {restaurant.price_range}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber/20 rounded px-1.5 py-0.5">
                        <Star className="w-3 h-3 text-amber fill-amber" />
                        <span className="text-sm font-semibold">{Number(restaurant.google_rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {restaurant.neighborhood}
                      </span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <Navigation className="w-3 h-3" />
                        Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Location Button */}
        <div className="absolute bottom-32 right-4">
          <Button variant="glass" size="icon" className="w-12 h-12 rounded-full shadow-lg">
            <Navigation className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
