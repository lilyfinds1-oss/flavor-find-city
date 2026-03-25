import { useState, useEffect, useMemo } from "react";
import { Navigation, MapPin, Loader2, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useCity } from "@/contexts/CityContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearMe() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { city } = useCity();

  const { data: restaurants, isLoading } = useRestaurants({ limit: 200 });

  const requestLocation = () => {
    setLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        setGeoError(
          err.code === 1
            ? "Location access denied. Please enable location in your browser settings."
            : "Unable to get your location. Please try again."
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      requestLocation();
    } else {
      setGeoError("Geolocation is not supported by your browser.");
    }
  }, []);

  const sorted = useMemo(() => {
    if (!coords || !restaurants) return null;
    return restaurants
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        ...r,
        distance: getDistanceKm(coords.lat, coords.lng, Number(r.latitude), Number(r.longitude)),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [coords, restaurants]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={`Restaurants Near Me in ${city?.name || "Pakistan"}`} description="Find the closest restaurants to your current location." />
      <Header />

      <main className="flex-1">
        <div className="bg-gradient-hero border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <div className="flex items-center gap-3">
              <Navigation className="w-7 h-7 text-primary" />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">Near Me</h1>
                <p className="text-muted-foreground text-sm">
                  {coords
                    ? `Showing restaurants sorted by distance from your location`
                    : "Enable location to find restaurants near you"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {geoError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
                <span>{geoError}</span>
                <Button size="sm" variant="outline" onClick={requestLocation}>
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Getting your location...</p>
            </div>
          )}

          {!loading && !geoError && !coords && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium mb-3">Location access needed</p>
              <Button onClick={requestLocation}>
                <Navigation className="w-4 h-4 mr-2" /> Enable Location
              </Button>
            </div>
          )}

          {isLoading && coords && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <Skeleton className="h-40 w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {sorted && sorted.length > 0 && (
            <>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {sorted.length} restaurants sorted by distance
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {sorted.map((r, i) => (
                  <div key={r.id} className="relative">
                    <RestaurantCard
                      id={r.id}
                      name={r.name}
                      slug={r.slug}
                      coverImage={r.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"}
                      cuisines={r.cuisines || []}
                      priceRange={r.price_range || "$$"}
                      neighborhood={`${r.distance.toFixed(1)} km away · ${r.neighborhood || r.city}`}
                      rating={Number(r.average_rating) || Number(r.google_rating) || 0}
                      reviewCount={r.total_reviews || 0}
                      rank={i + 1}
                      isTrending={(r.tiktok_trend_score || 0) > 70}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {sorted && sorted.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No restaurants with location data found nearby</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
