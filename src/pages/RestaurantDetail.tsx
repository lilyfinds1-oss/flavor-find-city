import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Phone, Globe, Clock, Heart, Share2, Navigation, ChevronLeft, Award, Users, Utensils, CheckCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRestaurant } from "@/hooks/useRestaurants";

export default function RestaurantDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: restaurant, isLoading } = useRestaurant(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Restaurant not found</h1>
            <Link to="/explore">
              <Button>Browse Restaurants</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96">
          <img
            src={restaurant.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Back button */}
          <Link to="/explore" className="absolute top-4 left-4">
            <Button variant="glass" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="glass" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Rank badge */}
          {restaurant.city_rank && restaurant.city_rank <= 100 && (
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-gradient-gold text-charcoal font-bold text-lg px-4 py-2">
                <Award className="w-5 h-5 mr-2" />
                #{restaurant.city_rank} in Toronto
              </Badge>
            </div>
          )}
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                      {restaurant.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                      <span>{restaurant.cuisines.join(" • ")}</span>
                      <span className="text-primary font-semibold">{restaurant.price_range}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber/20 rounded-lg px-3 py-2">
                    <Star className="w-6 h-6 text-amber fill-amber" />
                    <span className="font-display text-2xl font-bold">{Number(restaurant.google_rating).toFixed(1)}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {restaurant.is_halal && <Badge variant="secondary">🥙 Halal</Badge>}
                  {restaurant.is_family_friendly && <Badge variant="secondary">👨‍👩‍👧‍👦 Family Friendly</Badge>}
                  {restaurant.has_delivery && <Badge variant="secondary">🚗 Delivery</Badge>}
                  {restaurant.is_verified && (
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {restaurant.description && (
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{restaurant.description}</p>
                </div>
              )}

              {/* Signature Dishes */}
              {restaurant.signature_dishes && restaurant.signature_dishes.length > 0 && (
                <div>
                  <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    Must-Try Dishes
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.signature_dishes.map((dish, i) => (
                      <Badge key={i} variant="outline" className="text-base py-2 px-4">
                        {dish}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-4 text-center border border-border">
                  <div className="font-display text-2xl font-bold text-primary">{restaurant.google_review_count}</div>
                  <div className="text-sm text-muted-foreground">Google Reviews</div>
                </div>
                <div className="bg-card rounded-xl p-4 text-center border border-border">
                  <div className="font-display text-2xl font-bold text-amber">{restaurant.internal_votes}</div>
                  <div className="text-sm text-muted-foreground">Votes</div>
                </div>
                <div className="bg-card rounded-xl p-4 text-center border border-border">
                  <div className="font-display text-2xl font-bold text-success">{restaurant.tiktok_trend_score}</div>
                  <div className="text-sm text-muted-foreground">Trend Score</div>
                </div>
              </div>

              {/* Reviews Section Placeholder */}
              <div>
                <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Reviews ({restaurant.total_reviews})
                </h2>
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <p className="text-muted-foreground mb-4">Be the first to write a review!</p>
                  <Link to="/auth">
                    <Button variant="hero">Write a Review</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
                <h3 className="font-display font-semibold text-lg mb-4">Visit</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">{restaurant.address}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.neighborhood}, {restaurant.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-success font-medium">Open Now</span>
                  </div>

                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <a href={`tel:${restaurant.phone}`} className="hover:text-primary transition-colors">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}

                  {restaurant.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button variant="hero" size="lg" className="w-full gap-2">
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </Button>
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <Heart className="w-4 h-4" />
                    Save to Favorites
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
