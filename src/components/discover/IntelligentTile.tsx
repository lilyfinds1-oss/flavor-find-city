import { Link } from "react-router-dom";
import { Star, MapPin, TrendingUp, Flame, Clock, Users, Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TileType = "restaurant" | "editorial" | "trending" | "deal" | "collection";

export type AIContext = {
  reason: string;
  confidence?: "high" | "medium";
  icon?: "trending" | "location" | "time" | "preference" | "popular";
};

interface IntelligentTileProps {
  type: TileType;
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  priceRange?: string;
  neighborhood?: string;
  cuisines?: string[];
  aiContext?: AIContext;
  isTrending?: boolean;
  isHot?: boolean;
  dealText?: string;
  author?: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  className?: string;
}

const contextIcons = {
  trending: TrendingUp,
  location: MapPin,
  time: Clock,
  preference: Sparkles,
  popular: Users,
};

export function IntelligentTile({
  type,
  id,
  slug,
  title,
  subtitle,
  image,
  rating,
  reviewCount,
  priceRange,
  neighborhood,
  cuisines,
  aiContext,
  isTrending,
  isHot,
  dealText,
  author,
  className,
}: IntelligentTileProps) {
  const ContextIcon = aiContext?.icon ? contextIcons[aiContext.icon] : Sparkles;

  const linkPath = type === "restaurant" ? `/restaurant/${slug}` : `/${type}/${slug}`;

  return (
    <Link
      to={linkPath}
      className={cn(
        "group relative block rounded-2xl overflow-hidden transition-all duration-500",
        "bg-card border border-border/50",
        "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        "hover:-translate-y-1",
        className
      )}
    >
      {/* Image section */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isTrending && (
            <span className="chip-trending flex items-center gap-1 text-xs font-medium px-2.5 py-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
          {isHot && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gradient-primary text-white">
              <Flame className="w-3 h-3" />
              Hot
            </span>
          )}
          {dealText && (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-accent text-accent-foreground">
              {dealText}
            </span>
          )}
        </div>

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
          </div>
        )}

        {/* Bottom content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Author for editorial */}
          {author && (
            <div className="flex items-center gap-2 mb-2">
              {author.avatar ? (
                <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full border border-white/20" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {author.name[0]}
                </div>
              )}
              <span className="text-sm text-white/90">{author.name}</span>
              {author.verified && (
                <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-display text-xl font-bold text-white mb-1 line-clamp-2 group-hover:text-primary-glow transition-colors">
            {title}
          </h3>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-sm text-white/70">
            {cuisines && cuisines.length > 0 && (
              <span>{cuisines.slice(0, 2).join(" · ")}</span>
            )}
            {priceRange && (
              <>
                <span className="text-white/40">•</span>
                <span className="text-primary font-medium">{priceRange}</span>
              </>
            )}
            {neighborhood && (
              <>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {neighborhood}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Context footer */}
      {aiContext && (
        <div className="p-3 border-t border-border/50 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ContextIcon className="w-4 h-4 text-ai-pulse" />
              <span>{aiContext.reason}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      )}

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
      </div>
    </Link>
  );
}
