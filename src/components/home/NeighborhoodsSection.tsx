import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const neighborhoods = [
  {
    name: "Gulberg",
    description: "Upscale dining & cafes",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop",
    restaurantCount: 45,
  },
  {
    name: "DHA",
    description: "Modern eateries",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop",
    restaurantCount: 62,
  },
  {
    name: "MM Alam Road",
    description: "Food street vibes",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=400&fit=crop",
    restaurantCount: 38,
  },
  {
    name: "Johar Town",
    description: "Family favorites",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=400&fit=crop",
    restaurantCount: 29,
  },
  {
    name: "Model Town",
    description: "Classic spots",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&h=400&fit=crop",
    restaurantCount: 24,
  },
  {
    name: "Liberty",
    description: "Street food hub",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop",
    restaurantCount: 51,
  },
];

export function NeighborhoodsSection() {
  return (
    <section className="py-10 sm:py-12 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Explore by Neighborhood</h2>
              <p className="text-muted-foreground text-xs sm:text-sm">Discover Lahore's food districts</p>
            </div>
          </div>
          <Link to="/map">
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              Open map
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {neighborhoods.map((neighborhood, index) => (
            <Link
              key={neighborhood.name}
              to={`/explore?neighborhood=${encodeURIComponent(neighborhood.name)}`}
              className={cn(
                "group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden",
                "bg-card border border-border transition-all duration-300",
                "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={neighborhood.image}
                alt={neighborhood.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <h3 className="font-semibold text-white text-[11px] sm:text-sm line-clamp-1">
                  {neighborhood.name}
                </h3>
                <p className="text-white/70 text-[10px] sm:text-xs line-clamp-1 hidden sm:block">
                  {neighborhood.description}
                </p>
                <p className="text-white/50 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                  {neighborhood.restaurantCount} places
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
