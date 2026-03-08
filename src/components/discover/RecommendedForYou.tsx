import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Sparkles, Star, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Recommendation {
  restaurant_id: string;
  reason: string;
  confidence: number;
  restaurant: {
    id: string;
    name: string;
    slug: string;
    neighborhood: string;
    cuisines: string[];
    price_range: string;
    average_rating: number;
    cover_image: string;
    total_reviews: number;
  };
}

function usePersonalizedRecommendations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["personalized-recommendations", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-personalized-recommendations", {
        body: { userId: user?.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.recommendations || []) as Recommendation[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function RecommendedForYou() {
  const { user } = useAuth();
  const { data: recs, isLoading, error } = usePersonalizedRecommendations();

  if (!user) return null;
  if (error) return null;

  return (
    <section className="py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-display text-xl sm:text-2xl font-bold">For You</h2>
          </div>
          <Link to="/explore">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              See all <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          AI-powered picks based on your taste
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : recs && recs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recs.map((rec) => (
              <Link key={rec.restaurant_id} to={`/restaurant/${rec.restaurant.slug}`}>
                <div className="group bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all">
                  <div className="relative h-36">
                    <img
                      src={rec.restaurant.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop"}
                      alt={rec.restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-primary/90 text-primary-foreground text-[10px] gap-1">
                        <Sparkles className="w-3 h-3" />
                        {Math.round(rec.confidence * 100)}% match
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    <h3 className="font-semibold text-sm truncate">{rec.restaurant.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{rec.restaurant.neighborhood}</span>
                      <span className="text-primary font-medium">{rec.restaurant.price_range}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber text-amber" />
                      <span className="text-xs font-medium">{Number(rec.restaurant.average_rating).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({rec.restaurant.total_reviews})</span>
                    </div>
                    <p className="text-xs text-primary/80 font-medium mt-1">{rec.reason}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Save and review restaurants to get personalized recommendations!
          </div>
        )}
      </div>
    </section>
  );
}
