import { TrendingUp, MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCity } from "@/contexts/CityContext";
import { useCityStats } from "@/hooks/useCityStats";

interface TrendingItem {
  id: string;
  title: string;
  change: "up" | "down" | "new";
}

const trendingItems: TrendingItem[] = [
  { id: "1", title: "Late night biryani spots", change: "up" },
  { id: "2", title: "Rooftop restaurants", change: "new" },
  { id: "3", title: "Best paratha nearby", change: "up" },
  { id: "4", title: "Hidden gems", change: "up" },
];

export function LiveTrendingBar() {
  const { city } = useCity();
  const { data: stats, isLoading } = useCityStats();
  const nearbyHighlights = stats?.neighborhoods ?? [];
  return (
    <section className="py-6 border-y border-border/50 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Trending searches */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-trending animate-pulse" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Trending in {city?.name || "Pakistan"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingItems.slice(0, 4).map((item, index) => (
                <Link
                  key={item.id}
                  to={`/explore?q=${encodeURIComponent(item.title)}`}
                  className={cn(
                    "group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-200",
                    "bg-card border border-border/50 hover:border-trending/30 hover:bg-trending/5"
                  )}
                >
                  <span className="text-xs font-bold text-muted-foreground w-4 sm:w-5">
                    #{index + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-trending transition-colors">
                    {item.title}
                  </span>
                  {item.change === "new" && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-trending/20 text-trending">
                      New
                    </span>
                  )}
                  {item.change === "up" && (
                    <TrendingUp className="w-3 h-3 text-success" />
                  )}
                </Link>
              ))}
              <Link
                to="/explore"
                className="flex items-center gap-1 px-3 py-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Nearby highlights */}
          <div className="lg:w-72 lg:border-l lg:border-border/50 lg:pl-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Top neighborhoods
              </span>
            </div>
            <div className="flex lg:flex-col gap-2">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-9 rounded-lg shimmer flex-1 lg:flex-none" />
                ))
              ) : nearbyHighlights.length === 0 ? (
                <p className="text-xs text-muted-foreground">No neighborhoods yet.</p>
              ) : (
                nearbyHighlights.map((area, idx) => (
                  <Link
                    key={area.name}
                    to={`/explore?area=${encodeURIComponent(area.name)}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg transition-all",
                      idx === 0
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-xs sm:text-sm font-medium">{area.name}</span>
                    <span className="text-xs text-muted-foreground">{area.count} spots</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Time context */}
          <div className="hidden sm:block lg:w-48 lg:border-l lg:border-border/50 lg:pl-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                In {city?.name || "your city"}
              </span>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-2xl font-display font-bold text-foreground">
                {isLoading ? "—" : stats?.total ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">restaurants listed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
