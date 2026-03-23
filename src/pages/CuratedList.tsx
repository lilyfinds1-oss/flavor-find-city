import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

const LIST_CONFIG: Record<string, { title: string; description: string; cuisine?: string; tags?: string[]; icon: string }> = {
  biryani: {
    title: "Best Biryani",
    description: "The most flavorful and aromatic biryani spots in town. From traditional Lucknowi to spicy Hyderabadi styles.",
    cuisine: "desi",
    tags: ["biryani"],
    icon: "🍚",
  },
  "date-night": {
    title: "Date Night",
    description: "Romantic restaurants with great ambience, perfect for a special evening out.",
    tags: ["date-night", "romantic", "fine-dining"],
    cuisine: "fine_dining",
    icon: "🌹",
  },
  "late-night": {
    title: "Late Night Eats",
    description: "Craving food after midnight? These spots stay open late and serve delicious meals.",
    tags: ["late-night", "24-hours"],
    icon: "🌙",
  },
  "hidden-gems": {
    title: "Hidden Gems",
    description: "Under-the-radar restaurants loved by locals. Discover spots you won't find on the usual lists.",
    tags: ["hidden-gem", "underrated"],
    icon: "💎",
  },
  bbq: {
    title: "Best BBQ",
    description: "Sizzling grills, smoky flavors, and the juiciest tikkas. The best BBQ joints around.",
    cuisine: "bbq",
    tags: ["bbq", "grill", "tikka"],
    icon: "🔥",
  },
};

export default function CuratedList() {
  const { slug } = useParams<{ slug: string }>();
  const config = slug ? LIST_CONFIG[slug] : null;

  const { data: restaurants, isLoading } = useRestaurants({
    cuisine: config?.cuisine,
    sortBy: "ranking",
    limit: 50,
  });

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <PageTransition>
          <main className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <p className="text-4xl mb-4">🍽️</p>
              <h1 className="font-display text-2xl font-bold mb-2">List not found</h1>
              <Link to="/explore">
                <Button variant="hero" className="mt-4">Browse All Restaurants</Button>
              </Link>
            </div>
          </main>
        </PageTransition>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={`${config.title} — CityBites`}
        description={config.description}
      />
      <Header />
      <PageTransition>
        <main className="flex-1">
          {/* Hero */}
          <section className="relative bg-gradient-to-b from-primary/10 to-background py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-4">
              <Link to="/explore" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Explore
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{config.icon}</span>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                  {config.title}
                </h1>
              </div>
              <p className="text-muted-foreground max-w-2xl text-lg">{config.description}</p>
            </div>
          </section>

          {/* Results */}
          <section className="max-w-6xl mx-auto px-4 py-10">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-2xl" />
                ))}
              </div>
            ) : restaurants && restaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((r, i) => (
                  <RestaurantCard
                    key={r.id}
                    slug={r.slug}
                    name={r.name}
                    coverImage={r.cover_image}
                    cuisines={r.cuisines || []}
                    averageRating={r.average_rating}
                    totalReviews={r.total_reviews}
                    priceRange={r.price_range}
                    neighborhood={r.neighborhood}
                    rank={i + 1}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-display text-xl font-semibold mb-2">No restaurants found yet</h2>
                <p className="text-muted-foreground mb-6">We're still curating this list. Check back soon!</p>
                <Link to="/explore">
                  <Button variant="hero">Explore All Restaurants</Button>
                </Link>
              </div>
            )}
          </section>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
