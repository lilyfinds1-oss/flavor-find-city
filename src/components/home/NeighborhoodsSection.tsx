import { Link } from "react-router-dom";
import { MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const neighborhoods = [
  {
    name: "Gulberg",
    description: "Upscale dining & cafes",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    restaurantCount: 45,
  },
  {
    name: "DHA",
    description: "Modern eateries",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400",
    restaurantCount: 62,
  },
  {
    name: "MM Alam Road",
    description: "Food street vibes",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
    restaurantCount: 38,
  },
  {
    name: "Johar Town",
    description: "Family favorites",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
    restaurantCount: 29,
  },
  {
    name: "Model Town",
    description: "Classic spots",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400",
    restaurantCount: 24,
  },
  {
    name: "Liberty",
    description: "Street food hub",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400",
    restaurantCount: 51,
  },
];

export function NeighborhoodsSection() {
  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Explore by Neighborhood</h2>
              <p className="text-muted-foreground text-sm">Discover Lahore's food districts</p>
            </div>
          </div>
          <Link to="/map">
            <Button variant="ghost" className="gap-2">
              Open map
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {neighborhoods.map((neighborhood, index) => (
            <Link
              key={neighborhood.name}
              to={`/explore?neighborhood=${encodeURIComponent(neighborhood.name)}`}
              className={cn(
                "group relative aspect-square rounded-2xl overflow-hidden",
                "bg-card border border-border transition-all duration-300",
                "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <img
                src={neighborhood.image}
                alt={neighborhood.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="font-semibold text-white text-sm line-clamp-1">
                  {neighborhood.name}
                </h3>
                <p className="text-white/70 text-xs line-clamp-1">
                  {neighborhood.description}
                </p>
                <p className="text-white/50 text-xs mt-1">
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
