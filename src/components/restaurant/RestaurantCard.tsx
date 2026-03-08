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
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1.5">
          {rank && rank <= 10 && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-gold text-charcoal">
              #{rank}
            </span>
          )}
          {isTrending && (
            <span className="chip-trending flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Trending</span>
            </span>
          )}
          {isNew && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-success text-success-foreground">
              New
            </span>
          )}
          {hasDeal && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-accent text-accent-foreground">
              <Flame className="w-3 h-3" />
              Deal
            </span>
          )}
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/50 backdrop-blur-sm">
          <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent fill-accent" />
          <span className="text-xs sm:text-sm font-semibold text-white">{rating.toFixed(1)}</span>
        </div>

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className="font-display text-base sm:text-lg font-bold text-white mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-primary-glow transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/80">
            <span className="truncate">{cuisines.slice(0, 2).join(" · ")}</span>
            <span className="text-primary font-medium shrink-0">{priceRange}</span>
          </div>
        </div>
      </div>

      {/* Content footer */}
      <div className="p-2.5 sm:p-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground min-w-0">
            <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="line-clamp-1">{neighborhood}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full shrink-0",
            isOpen 
              ? "bg-success/20 text-success" 
              : "bg-destructive/20 text-destructive"
          )}>
            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {isOpen ? "Open" : "Closed"}
          </div>
        </div>

        {aiReason && (
          <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-ai-pulse">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{aiReason}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
