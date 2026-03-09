import { useState, useMemo } from "react";
import { List, Map as MapIcon, Navigation } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useAppConfig } from "@/hooks/useAppConfig";
import { RestaurantMap } from "@/components/map/RestaurantMap";
import { MapFilters, MapFilterState } from "@/components/map/MapFilters";
import { TrendingBanner } from "@/components/map/TrendingBanner";
import { RestaurantCardSlider } from "@/components/map/RestaurantCardSlider";

export default function MapPage() {
  const [showList, setShowList] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>();
  const [filters, setFilters] = useState<MapFilterState>({
    cuisines: [],
    priceRange: [],
    isHalal: false,
    isFamilyFriendly: false,
    hasDelivery: false,
  });

  const { data: mapboxToken, isLoading: tokenLoading } = useAppConfig("mapbox_public_token");
  const { data: restaurants, isLoading: restaurantsLoading } = useRestaurants({ limit: 100 });

  // Apply filters
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    return restaurants.filter((r) => {
      // Cuisine filter
      if (
        filters.cuisines.length > 0 &&
        !filters.cuisines.some((c) => r.cuisines.includes(c as any))
      ) {
        return false;
      }

      // Price filter
      if (
        filters.priceRange.length > 0 &&
        !filters.priceRange.includes(r.price_range)
      ) {
        return false;
      }

      // Feature filters
      if (filters.isHalal && !r.is_halal) return false;
      if (filters.isFamilyFriendly && !r.is_family_friendly) return false;
      if (filters.hasDelivery && !r.has_delivery) return false;

      return true;
    });
  }, [restaurants, filters]);

  // Count trending restaurants
  const trendingCount = useMemo(() => {
    return filteredRestaurants.filter((r) => r.tiktok_trend_score >= 50).length;
  }, [filteredRestaurants]);

  // Get restaurants for the slider (prioritize trending)
  const sliderRestaurants = useMemo(() => {
    return [...filteredRestaurants]
      .sort((a, b) => b.tiktok_trend_score - a.tiktok_trend_score)
      .slice(0, 10);
  }, [filteredRestaurants]);

  const isLoading = tokenLoading || restaurantsLoading;

  return (
    <div className="h-screen flex flex-col bg-background">
      <SEOHead title="Restaurant Map" description="Explore restaurants on an interactive map of Lahore. Filter by cuisine, price, and features." />
      <Header />

      <main className="flex-1 relative">
        {/* Map */}
        <div className="absolute inset-0">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <RestaurantMap
              restaurants={filteredRestaurants}
              mapboxToken={mapboxToken || ""}
              selectedRestaurantId={selectedRestaurantId}
              onMarkerClick={(r) => setSelectedRestaurantId(r.id)}
            />
          )}
        </div>

        {/* Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
            <MapFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          <Button
            variant="glass"
            size="sm"
            onClick={() => setShowList(!showList)}
            className="gap-2 pointer-events-auto"
          >
            {showList ? (
              <MapIcon className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
            {showList ? "Map" : "List"}
          </Button>
        </div>

        {/* Trending Near You Banner */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <TrendingBanner count={trendingCount} />
        </div>

        {/* Bottom Restaurant Cards */}
        <div className="absolute bottom-4 left-4 right-4">
          <RestaurantCardSlider
            restaurants={sliderRestaurants}
            selectedId={selectedRestaurantId}
            onSelect={(r) => setSelectedRestaurantId(r.id)}
          />
        </div>

        {/* Re-center Button */}
        <div className="absolute bottom-32 right-4">
          <Button
            variant="glass"
            size="icon"
            className="w-12 h-12 rounded-full shadow-lg"
            onClick={() => setSelectedRestaurantId(undefined)}
          >
            <Navigation className="w-5 h-5" />
          </Button>
        </div>
      </main>
    </div>
  );
}
