import { Link } from "react-router-dom";
import { ChevronRight, TrendingUp, Flame } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";

// Mock data for trending restaurants
const trendingRestaurants = [
  {
    id: "1",
    name: "The Smokehouse BBQ",
    slug: "smokehouse-bbq",
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
    cuisines: ["BBQ", "American"],
    priceRange: "$$",
    neighborhood: "Queen West",
    rating: 4.8,
    reviewCount: 234,
    rank: 1,
    isTrending: true,
    hasDeal: true,
  },
  {
    id: "2",
    name: "Spice Garden",
    slug: "spice-garden",
    coverImage: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    cuisines: ["Indian", "Desi"],
    priceRange: "$$",
    neighborhood: "Little India",
    rating: 4.7,
    reviewCount: 189,
    rank: 2,
    isTrending: true,
  },
  {
    id: "3",
    name: "Sakura Sushi",
    slug: "sakura-sushi",
    coverImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
    cuisines: ["Japanese", "Sushi"],
    priceRange: "$$$",
    neighborhood: "Downtown",
    rating: 4.9,
    reviewCount: 312,
    rank: 3,
    isNew: true,
  },
  {
    id: "4",
    name: "Mediterranean Grill",
    slug: "mediterranean-grill",
    coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
    cuisines: ["Mediterranean", "Halal"],
    priceRange: "$$",
    neighborhood: "North York",
    rating: 4.6,
    reviewCount: 156,
    hasDeal: true,
  },
];

export function TrendingSection() {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Flame className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Trending This Week
              </h2>
              <p className="text-muted-foreground mt-1">
                Most popular spots based on votes and reviews
              </p>
            </div>
          </div>
          <Link
            to="/explore?sort=trending"
            className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline"
          >
            See all trending
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {trendingRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} {...restaurant} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/explore?sort=trending"
            className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
          >
            See all trending restaurants
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
