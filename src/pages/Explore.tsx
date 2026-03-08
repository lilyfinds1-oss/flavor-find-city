import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, MapPin, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRestaurants, useCategories } from "@/hooks/useRestaurants";
import { useAISearch, isNaturalLanguageQuery } from "@/hooks/useAISearch";

const priceRanges = ["$", "$$", "$$$", "$$$$"];
const sortOptions = [
  { value: "ranking", label: "Top Ranked" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
  { value: "trending", label: "Trending" },
];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  const search = searchParams.get("q") || "";
  const cuisine = searchParams.get("cuisine") || "";
  const priceRange = searchParams.get("price") || "";
  const sortBy = (searchParams.get("sort") as "ranking" | "rating" | "reviews" | "trending") || "ranking";
  const isHalal = searchParams.get("halal") === "true";

  const useAI = isNaturalLanguageQuery(search);
  
  const { data: restaurants, isLoading } = useRestaurants({
    cuisine: cuisine || undefined,
    priceRange: priceRange || undefined,
    sortBy,
    isHalal: isHalal || undefined,
    search: (!useAI && search) ? search : undefined,
  });

  const { data: aiResults, isLoading: aiLoading } = useAISearch(search, useAI);

  const { data: categories } = useCategories();

  const displayRestaurants = useAI && aiResults ? aiResults : restaurants;
  const displayLoading = useAI ? aiLoading : isLoading;

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFiltersCount = [cuisine, priceRange, isHalal ? "halal" : ""].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-hero border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
              Explore Restaurants
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Discover {displayRestaurants?.length || 0}+ amazing places to eat in Lahore
            </p>

            {/* Search bar */}
            <div className="flex gap-2 mt-4 sm:mt-6 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search restaurants..."
                  value={search}
                  onChange={(e) => updateFilter("q", e.target.value || null)}
                  className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm"
                />
              </div>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1.5 sm:gap-2 h-10 sm:h-12 px-3 sm:px-4"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 bg-primary-foreground text-primary h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-b border-border bg-card animate-slide-in-bottom">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                <Select value={cuisine} onValueChange={(v) => updateFilter("cuisine", v || null)}>
                  <SelectTrigger className="w-[140px] sm:w-[180px] text-sm">
                    <SelectValue placeholder="All Cuisines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cuisines</SelectItem>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-1">
                  {priceRanges.map((price) => (
                    <Button
                      key={price}
                      variant={priceRange === price ? "default" : "outline"}
                      size="sm"
                      className="text-xs sm:text-sm px-2 sm:px-3"
                      onClick={() => updateFilter("price", priceRange === price ? null : price)}
                    >
                      {price}
                    </Button>
                  ))}
                </div>

                <Button
                  variant={isHalal ? "default" : "outline"}
                  size="sm"
                  className="text-xs sm:text-sm"
                  onClick={() => updateFilter("halal", isHalal ? null : "true")}
                >
                  🥙 Halal
                </Button>

                <Select value={sortBy} onValueChange={(v) => updateFilter("sort", v)}>
                  <SelectTrigger className="w-[130px] sm:w-[160px] text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive text-xs sm:text-sm">
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl h-72 sm:h-80 animate-pulse" />
              ))}
            </div>
          ) : restaurants && restaurants.length > 0 ? (
            <>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Showing {restaurants.length} restaurants
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 stagger-children">
                {restaurants.map((restaurant, index) => (
                  <RestaurantCard
                    key={restaurant.id}
                    id={restaurant.id}
                    name={restaurant.name}
                    slug={restaurant.slug}
                    coverImage={restaurant.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"}
                    cuisines={restaurant.cuisines}
                    priceRange={restaurant.price_range}
                    neighborhood={restaurant.neighborhood || restaurant.city}
                    rating={Number(restaurant.average_rating) || Number(restaurant.google_rating)}
                    reviewCount={restaurant.total_reviews}
                    rank={index + 1}
                    isTrending={restaurant.tiktok_trend_score > 70}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">No restaurants found</h2>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
