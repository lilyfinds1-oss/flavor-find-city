import { Link } from "react-router-dom";
import { Star, MapPin, TrendingUp, Heart, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RestaurantCardProps {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  cuisines: string[];
  priceRange: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  rank?: number;
  isOpen?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  hasDeal?: boolean;
}

export function RestaurantCard({
  id,
  name,
  slug,
  coverImage,
  cuisines,
  priceRange,
  neighborhood,
  rating,
  reviewCount,
  rank,
  isOpen = true,
  isTrending = false,
  isNew = false,
  hasDeal = false,
}: RestaurantCardProps) {
  return (
    <Link
      to={`/restaurant/${slug}`}
      className="group block bg-card rounded-2xl overflow-hidden card-hover border border-border/50"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {rank && rank <= 10 && (
            <Badge className="bg-gradient-gold text-charcoal font-bold border-0">
              #{rank}
            </Badge>
          )}
          {isTrending && (
            <Badge className="bg-primary text-primary-foreground border-0 gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-success text-success-foreground border-0">
              New
            </Badge>
          )}
          {hasDeal && (
            <Badge className="bg-amber text-charcoal font-semibold border-0">
              Deal
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <Button
          variant="glass"
          size="icon"
          className="absolute top-3 right-3 w-9 h-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            // Handle favorite
          }}
        >
          <Heart className="w-4 h-4" />
        </Button>

        {/* Bottom info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-4 h-4 text-amber fill-amber" />
              <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
              <span className="text-xs text-white/70">({reviewCount})</span>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs px-2 py-1 rounded-full backdrop-blur-sm",
            isOpen ? "bg-success/80 text-white" : "bg-red-500/80 text-white"
          )}>
            <Clock className="w-3 h-3" />
            {isOpen ? "Open" : "Closed"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {name}
        </h3>
        
        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
          <span>{cuisines.slice(0, 2).join(" • ")}</span>
          <span className="text-primary font-medium">{priceRange}</span>
        </div>

        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{neighborhood}</span>
        </div>
      </div>
    </Link>
  );
}
