import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { useSavedRestaurants } from "@/hooks/useSavedRestaurants";

export function SavedRestaurants() {
  const { data: saved, isLoading } = useSavedRestaurants();

  return (
    <Card className="md:col-span-3">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          Saved Restaurants ({saved?.length || 0})
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your favorite spots in one place</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : saved && saved.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {saved.map((item: any) => (
              <RestaurantCard
                key={item.id}
                id={item.restaurants.id}
                name={item.restaurants.name}
                slug={item.restaurants.slug}
                coverImage={item.restaurants.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"}
                cuisines={item.restaurants.cuisines}
                priceRange={item.restaurants.price_range}
                neighborhood={item.restaurants.neighborhood || item.restaurants.city}
                rating={Number(item.restaurants.average_rating) || 0}
                reviewCount={item.restaurants.total_reviews || 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No saved restaurants yet</p>
            <Link to="/explore" className="text-sm text-primary font-medium hover:underline">
              Explore restaurants →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
