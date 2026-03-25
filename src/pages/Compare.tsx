import { useState } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Star, MapPin, DollarSign, Search, ArrowLeft, Utensils, Users, Truck, Scale } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRestaurants, type Restaurant } from "@/hooks/useRestaurants";
import { useCity } from "@/contexts/CityContext";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 3;

function RestaurantPicker({
  onSelect,
  excludeIds,
}: {
  onSelect: (r: Restaurant) => void;
  excludeIds: string[];
}) {
  const [search, setSearch] = useState("");
  const { data: restaurants } = useRestaurants({ search: search || undefined, limit: 20 });

  const filtered = restaurants?.filter((r) => !excludeIds.includes(r.id)) || [];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search restaurants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-1">
        {filtered.slice(0, 10).map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 text-left transition-colors"
          >
            <img
              src={r.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop"}
              alt={r.name}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground truncate">{r.neighborhood || r.city}</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && search && (
          <p className="text-sm text-muted-foreground text-center py-4">No restaurants found</p>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({ label, icon, values }: { label: string; icon: React.ReactNode; values: React.ReactNode[] }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `160px repeat(${values.length}, 1fr)` }}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground py-3">
        {icon}
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i} className="py-3 text-sm">{v}</div>
      ))}
    </div>
  );
}

export default function Compare() {
  const [selected, setSelected] = useState<Restaurant[]>([]);
  const [addingSlot, setAddingSlot] = useState<number | null>(null);
  const { city } = useCity();

  const addRestaurant = (r: Restaurant) => {
    if (selected.length < MAX_COMPARE) {
      setSelected([...selected, r]);
    }
    setAddingSlot(null);
  };

  const removeRestaurant = (id: string) => {
    setSelected(selected.filter((r) => r.id !== id));
  };

  const getBestValue = (getter: (r: Restaurant) => number, higher = true) => {
    if (selected.length < 2) return -1;
    const vals = selected.map(getter);
    return higher ? vals.indexOf(Math.max(...vals)) : vals.indexOf(Math.min(...vals));
  };

  const ratingBest = getBestValue((r) => Number(r.average_rating) || Number(r.google_rating) || 0);
  const reviewsBest = getBestValue((r) => r.total_reviews || 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Compare Restaurants" description={`Compare restaurants side-by-side in ${city?.name || "Pakistan"}`} />
      <Header />

      <main className="flex-1">
        <div className="bg-gradient-hero border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
            <Link to="/explore" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to Explore
            </Link>
            <div className="flex items-center gap-3">
              <Scale className="w-7 h-7 text-primary" />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold">Compare Restaurants</h1>
                <p className="text-muted-foreground text-sm">Select up to 3 restaurants to compare side-by-side</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {/* Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {selected.map((r, i) => (
              <Card key={r.id} className="relative overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-7 w-7 bg-background/80 backdrop-blur-sm"
                  onClick={() => removeRestaurant(r.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={r.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"}
                    alt={r.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="font-display font-bold truncate">{r.name}</h3>
                  <p className="text-xs text-muted-foreground">{r.neighborhood || r.city}</p>
                </CardContent>
              </Card>
            ))}

            {selected.length < MAX_COMPARE && (
              <Card
                className={cn(
                  "flex flex-col items-center justify-center min-h-[200px] border-dashed cursor-pointer hover:border-primary/50 transition-colors",
                  addingSlot !== null && "border-primary"
                )}
                onClick={() => setAddingSlot(selected.length)}
              >
                {addingSlot === selected.length ? (
                  <CardContent className="p-4 w-full">
                    <RestaurantPicker
                      onSelect={addRestaurant}
                      excludeIds={selected.map((r) => r.id)}
                    />
                  </CardContent>
                ) : (
                  <CardContent className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Plus className="w-8 h-8" />
                    <span className="text-sm font-medium">Add Restaurant</span>
                  </CardContent>
                )}
              </Card>
            )}
          </div>

          {/* Comparison Table */}
          {selected.length >= 2 && (
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-1 overflow-x-auto">
                <h2 className="font-display text-lg font-bold mb-4">Side-by-Side Comparison</h2>

                <div className="min-w-[500px]">
                  <ComparisonRow
                    label="Rating"
                    icon={<Star className="w-4 h-4" />}
                    values={selected.map((r, i) => {
                      const rating = Number(r.average_rating) || Number(r.google_rating) || 0;
                      return (
                        <div className={cn("flex items-center gap-1.5", i === ratingBest && "text-primary font-bold")}>
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          {rating.toFixed(1)}
                          {i === ratingBest && <Badge variant="secondary" className="text-[10px] ml-1">Best</Badge>}
                        </div>
                      );
                    })}
                  />

                  <ComparisonRow
                    label="Price"
                    icon={<DollarSign className="w-4 h-4" />}
                    values={selected.map((r) => (
                      <span className="font-medium">{r.price_range || "N/A"}</span>
                    ))}
                  />

                  <ComparisonRow
                    label="Cuisines"
                    icon={<Utensils className="w-4 h-4" />}
                    values={selected.map((r) => (
                      <div className="flex flex-wrap gap-1">
                        {(r.cuisines || []).map((c) => (
                          <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    ))}
                  />

                  <ComparisonRow
                    label="Reviews"
                    icon={<Users className="w-4 h-4" />}
                    values={selected.map((r, i) => (
                      <span className={cn(i === reviewsBest && "text-primary font-bold")}>
                        {r.total_reviews || 0} reviews
                        {i === reviewsBest && <Badge variant="secondary" className="text-[10px] ml-1">Most</Badge>}
                      </span>
                    ))}
                  />

                  <ComparisonRow
                    label="Location"
                    icon={<MapPin className="w-4 h-4" />}
                    values={selected.map((r) => (
                      <span>{r.neighborhood || r.city}</span>
                    ))}
                  />

                  <ComparisonRow
                    label="Halal"
                    icon={<span className="text-sm">🥙</span>}
                    values={selected.map((r) => (
                      <span>{r.is_halal ? "✅ Yes" : "❌ No"}</span>
                    ))}
                  />

                  <ComparisonRow
                    label="Delivery"
                    icon={<Truck className="w-4 h-4" />}
                    values={selected.map((r) => (
                      <span>{r.has_delivery ? "✅ Yes" : "❌ No"}</span>
                    ))}
                  />

                  <ComparisonRow
                    label="Family"
                    icon={<Users className="w-4 h-4" />}
                    values={selected.map((r) => (
                      <span>{r.is_family_friendly ? "✅ Yes" : "❌ No"}</span>
                    ))}
                  />
                </div>

                {/* View Detail Links */}
                <div className="grid gap-4 pt-4 border-t border-border" style={{ gridTemplateColumns: `160px repeat(${selected.length}, 1fr)` }}>
                  <div />
                  {selected.map((r) => (
                    <Link key={r.id} to={`/restaurant/${r.slug}`}>
                      <Button variant="outline" size="sm" className="w-full">View Details</Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selected.length < 2 && (
            <div className="text-center py-12 text-muted-foreground">
              <Scale className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Select at least 2 restaurants to compare</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
