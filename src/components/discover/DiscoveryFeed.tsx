import { useState } from "react";
import { TrendingUp, Flame, Clock, Sparkles, ChevronRight, Filter, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntelligentTile, TileType, AIContext } from "./IntelligentTile";
import { cn } from "@/lib/utils";
import { useDiscoveryFeed } from "@/hooks/useDiscoveryFeed";

const feedFilters = [
  { id: "all", label: "For You", icon: Sparkles },
  { id: "trending", label: "Trending", icon: TrendingUp },
  { id: "hot", label: "Hot Right Now", icon: Flame },
  { id: "new", label: "New", icon: Clock },
];

interface DiscoveryFeedProps {
  searchQuery?: string;
}

export function DiscoveryFeed({ searchQuery }: DiscoveryFeedProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data: feedItems, isLoading, isError } = useDiscoveryFeed(activeFilter, page);

  return (
    <section className="relative py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header with filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2">
            {feedFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => { setActiveFilter(filter.id); setPage(0); }}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200",
                    activeFilter === filter.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* AI context banner */}
        {searchQuery && (
          <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3 animate-fade-in-up">
            <div className="w-10 h-10 rounded-xl bg-gradient-ai flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground">Showing results for</p>
              <p className="font-medium text-foreground truncate">"{searchQuery}"</p>
            </div>
            <Button variant="ghost" size="sm">
              Clear
            </Button>
          </div>
        )}

        {/* Feed grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to load feed. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => setPage(0)}>
              Retry
            </Button>
          </div>
        ) : feedItems && feedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedItems.map((item, index) => (
              <div
                key={item.id}
                className="feed-item"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <IntelligentTile
                  id={item.id}
                  type={item.type as TileType}
                  slug={item.slug}
                  title={item.title}
                  subtitle={item.subtitle}
                  image={item.image}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                  priceRange={item.priceRange}
                  neighborhood={item.neighborhood}
                  cuisines={item.cuisines}
                  isTrending={item.isTrending}
                  isHot={item.isHot}
                  dealText={item.dealText}
                  aiContext={item.aiContext as AIContext}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No items to show right now.</p>
          </div>
        )}

        {/* Load more */}
        {feedItems && feedItems.length > 0 && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" className="gap-2" onClick={() => setPage((p) => p + 1)}>
              Load more
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
