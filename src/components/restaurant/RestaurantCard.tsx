import { Link } from "react-router-dom";
import { Star, MapPin, TrendingUp, Flame, Clock, Sparkles } from "lucide-react";
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
  aiReason?: string;
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
  aiReason,
}: RestaurantCardProps) {
  return (
    <Link
      to={`/restaurant/${slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-500 bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {rank && rank <= 10 && (
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-gold text-charcoal">
              #{rank}
            </span>
          )}
          {isTrending && (
            <span className="chip-trending flex items-center gap-1 text-xs font-medium px-2.5 py-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
          {isNew && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-success text-success-foreground">
              New
            </span>
          )}
          {hasDeal && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
              <Flame className="w-3 h-3" />
              Deal
            </span>
          )}
        </div>

        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 text-accent fill-accent" />
          <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
        </div>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-primary-glow transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <span>{cuisines.slice(0, 2).join(" · ")}</span>
            <span className="text-primary font-medium">{priceRange}</span>
          </div>
        </div>
      </div>

      {/* Content footer */}
      <div className="p-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{neighborhood}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
            isOpen 
              ? "bg-success/20 text-success" 
              : "bg-destructive/20 text-destructive"
          )}>
            <Clock className="w-3 h-3" />
            {isOpen ? "Open" : "Closed"}
          </div>
        </div>

        {/* AI reason */}
        {aiReason && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-ai-pulse">
            <Sparkles className="w-3 h-3" />
            <span>{aiReason}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
