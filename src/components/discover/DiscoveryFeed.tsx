import { useState, useEffect } from "react";
import { TrendingUp, Flame, Clock, Sparkles, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntelligentTile, TileType, AIContext } from "./IntelligentTile";
import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  type: TileType;
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
  size?: "normal" | "large" | "wide";
}

// Mock data for the discovery feed
const mockFeedItems: FeedItem[] = [
  {
    id: "1",
    type: "restaurant",
    slug: "cafe-aylanto",
    title: "Cafe Aylanto",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop",
    rating: 4.8,
    reviewCount: 234,
    priceRange: "$$$",
    neighborhood: "Gulberg",
    cuisines: ["Continental", "Italian"],
    aiContext: { reason: "Trending this week in Lahore", icon: "trending", confidence: "high" },
    isTrending: true,
    size: "large",
  },
  {
    id: "2",
    type: "restaurant",
    slug: "bundu-khan",
    title: "Bundu Khan",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    rating: 4.5,
    reviewCount: 567,
    priceRange: "$$",
    neighborhood: "Liberty",
    cuisines: ["Pakistani", "BBQ"],
    aiContext: { reason: "Popular for dinner right now", icon: "time" },
    isHot: true,
  },
  {
    id: "3",
    type: "editorial",
    slug: "best-biryani-spots",
    title: "The Ultimate Guide to Lahore's Best Biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
    author: { name: "Sarah Khan", verified: true },
    aiContext: { reason: "Based on your preferences", icon: "preference" },
    size: "wide",
  },
  {
    id: "4",
    type: "restaurant",
    slug: "cosa-nostra",
    title: "Cosa Nostra",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
    rating: 4.7,
    reviewCount: 189,
    priceRange: "$$$$",
    neighborhood: "MM Alam Road",
    cuisines: ["Italian", "Pizza"],
    aiContext: { reason: "Great for date night", icon: "popular" },
    dealText: "20% off",
  },
  {
    id: "5",
    type: "restaurant",
    slug: "andaaz",
    title: "Andaaz Restaurant",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop",
    rating: 4.6,
    reviewCount: 312,
    priceRange: "$$$",
    neighborhood: "DHA Phase 5",
    cuisines: ["Desi", "Pakistani"],
    aiContext: { reason: "Highly rated near you", icon: "location" },
  },
  {
    id: "6",
    type: "deal",
    slug: "lunch-deals",
    title: "Today's Lunch Specials",
    subtitle: "Up to 40% off at 15 restaurants",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
    dealText: "Limited time",
    aiContext: { reason: "Ends in 3 hours", icon: "time" },
  },
  {
    id: "7",
    type: "restaurant",
    slug: "monal-lahore",
    title: "Monal Lahore",
    image: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&h=600&fit=crop",
    rating: 4.4,
    reviewCount: 445,
    priceRange: "$$$",
    neighborhood: "Fortress Stadium",
    cuisines: ["Pakistani", "BBQ"],
    isTrending: true,
    aiContext: { reason: "Featured this month", icon: "trending" },
  },
  {
    id: "8",
    type: "restaurant",
    slug: "haveli",
    title: "Haveli Restaurant",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
    rating: 4.3,
    reviewCount: 678,
    priceRange: "$$",
    neighborhood: "Food Street",
    cuisines: ["Traditional", "Lahori"],
    aiContext: { reason: "Classic Lahore experience", icon: "popular" },
  },
];

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
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setFeedItems(mockFeedItems);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

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
                  onClick={() => setActiveFilter(filter.id)}
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

        {/* Feed grid - consistent uniform grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedItems.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "feed-item",
                  item.size === "large" && "sm:col-span-2 lg:col-span-1",
                  item.size === "wide" && "sm:col-span-2 lg:col-span-1"
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <IntelligentTile
                  {...item}
                  className="h-full"
                />
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" size="lg" className="gap-2">
            Load more
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
