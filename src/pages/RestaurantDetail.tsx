import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Phone, Globe, Clock, Heart, Share2, Navigation, ChevronLeft, Award, Users, Utensils, CheckCircle } from "lucide-react";
import { useIsSaved, useToggleSave } from "@/hooks/useSavedRestaurants";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRestaurant } from "@/hooks/useRestaurants";
import { useRestaurantReviews, useRefreshReviews } from "@/hooks/useRestaurantReviews";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewVoteButton } from "@/components/reviews/ReviewVoteButton";
import { ShareReview } from "@/components/reviews/ShareReview";
import { ClaimRestaurant } from "@/components/restaurant/ClaimRestaurant";
import { formatDistanceToNow } from "date-fns";
import { SEOHead } from "@/components/seo/SEOHead";

function SaveButton({ restaurantId }: { restaurantId: string }) {
  const { user } = useAuth();
  const { data: isSaved } = useIsSaved(restaurantId);
  const toggleSave = useToggleSave();

  const handleSave = () => {
    if (!user) { window.location.href = "/auth"; return; }
    toggleSave.mutate({ restaurantId, isSaved: !!isSaved });
  };

  return (
    <Button variant="glass" size="icon" onClick={handleSave} disabled={toggleSave.isPending}>
      <Heart className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
    </Button>
  );
}

function SidebarSaveButton({ restaurantId }: { restaurantId: string }) {
  const { user } = useAuth();
  const { data: isSaved } = useIsSaved(restaurantId);
  const toggleSave = useToggleSave();

  const handleSave = () => {
    if (!user) { window.location.href = "/auth"; return; }
    toggleSave.mutate({ restaurantId, isSaved: !!isSaved });
  };

  return (
    <Button variant="outline" size="lg" className="w-full gap-2" onClick={handleSave} disabled={toggleSave.isPending}>
      <Heart className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
      {isSaved ? "Saved" : "Save to Favorites"}
    </Button>
  );
}

function ReviewsSection({ restaurantId, restaurantName, restaurantSlug }: { restaurantId: string; restaurantName: string; restaurantSlug: string }) {
  const { data: reviews, isLoading } = useRestaurantReviews(restaurantId);
  const refreshReviews = useRefreshReviews(restaurantId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 sm:p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-4" />
            <div className="h-3 bg-muted rounded w-full mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {reviews && reviews.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-card rounded-xl border border-border p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                    <AvatarImage src={review.profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs sm:text-sm">
                      {review.profile?.display_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm sm:text-base">{review.profile?.display_name || "Anonymous"}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {review.created_at && formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 sm:w-4 sm:h-4 ${
                        star <= review.rating ? "fill-primary text-primary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2">{review.title}</h4>
              )}
              <p className="text-muted-foreground text-sm leading-relaxed mb-3 sm:mb-4">
                {review.content}
              </p>

              {review.photos && review.photos.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                  {review.photos.map((photo: string, i: number) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Review photo ${i + 1}`}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-lg object-cover border border-border hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => window.open(photo, "_blank")}
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <ReviewVoteButton
                  reviewId={review.id}
                  initialHelpfulVotes={review.helpful_votes || 0}
                />
                <ShareReview
                  restaurantName={restaurantName}
                  restaurantSlug={restaurantSlug}
                  rating={review.rating}
                  reviewTitle={review.title}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 text-center">
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}

      <ReviewForm
        restaurantId={restaurantId}
        restaurantName={restaurantName}
        onSuccess={refreshReviews}
      />
    </div>
  );
}

export default function RestaurantDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: restaurant, isLoading } = useRestaurant(slug || "");

  const handleGetDirections = () => {
    if (restaurant?.latitude && restaurant?.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`, "_blank");
    }
  };

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
            <Link to="/explore"><Button>Browse Restaurants</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressCountry: "PK",
    },
    ...(restaurant.average_rating && { aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: Number(restaurant.average_rating).toFixed(1),
      reviewCount: restaurant.total_reviews || 0,
    }}),
    ...(restaurant.cuisines && { servesCuisine: restaurant.cuisines.map(c => c.replace("_", " ")) }),
    ...(restaurant.price_range && { priceRange: restaurant.price_range }),
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title={restaurant.name}
        description={restaurant.description || `Discover ${restaurant.name} in ${restaurant.neighborhood || restaurant.city}. Read reviews, view menu, and get directions.`}
        image={restaurant.cover_image || undefined}
        type="restaurant"
        jsonLd={jsonLd}
      />
      <Header />
      
      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-48 sm:h-64 md:h-96">
          <img
            src={restaurant.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=600&fit=crop"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          <Link to="/explore" className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <Button variant="glass" size="icon" className="w-9 h-9 sm:w-10 sm:h-10">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>

          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2">
            <SaveButton restaurantId={restaurant.id} />
            <Button variant="glass" size="icon" className="w-9 h-9 sm:w-10 sm:h-10">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {restaurant.city_rank && restaurant.city_rank <= 100 && (
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
              <Badge className="bg-gradient-gold text-charcoal font-bold text-sm sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                #{restaurant.city_rank} in Lahore
              </Badge>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                  <div className="min-w-0">
                    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2">
                      {restaurant.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                      <span>{restaurant.cuisines.join(" • ")}</span>
                      <span className="text-primary font-semibold">{restaurant.price_range}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber/20 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 shrink-0">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber fill-amber" />
                    <span className="font-display text-xl sm:text-2xl font-bold">{Number(restaurant.google_rating).toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {restaurant.is_halal && <Badge variant="secondary" className="text-xs">🥙 Halal</Badge>}
                  {restaurant.is_family_friendly && <Badge variant="secondary" className="text-xs">👨‍👩‍👧‍👦 Family</Badge>}
                  {restaurant.has_delivery && <Badge variant="secondary" className="text-xs">🚗 Delivery</Badge>}
                  {restaurant.is_verified && (
                    <Badge className="bg-success text-success-foreground text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mobile sidebar actions */}
              <div className="lg:hidden flex gap-2">
                <Button variant="hero" size="lg" className="flex-1 gap-2" onClick={handleGetDirections}>
                  <Navigation className="w-4 h-4" />
                  Directions
                </Button>
                <SidebarSaveButton restaurantId={restaurant.id} />
              </div>

              {restaurant.description && (
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold mb-2 sm:mb-3">About</h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{restaurant.description}</p>
                </div>
              )}

              {restaurant.signature_dishes && restaurant.signature_dishes.length > 0 && (
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Must-Try Dishes
                  </h2>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {restaurant.signature_dishes.map((dish, i) => (
                      <Badge key={i} variant="outline" className="text-xs sm:text-base py-1 sm:py-2 px-2.5 sm:px-4">
                        {dish}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-card rounded-xl p-3 sm:p-4 text-center border border-border">
                  <div className="font-display text-lg sm:text-2xl font-bold text-primary">{restaurant.google_review_count}</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Google Reviews</div>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 text-center border border-border">
                  <div className="font-display text-lg sm:text-2xl font-bold text-amber">{restaurant.internal_votes}</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Votes</div>
                </div>
                <div className="bg-card rounded-xl p-3 sm:p-4 text-center border border-border">
                  <div className="font-display text-lg sm:text-2xl font-bold text-success">{restaurant.tiktok_trend_score}</div>
                  <div className="text-[10px] sm:text-sm text-muted-foreground">Trend Score</div>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Community Reviews
                </h2>
                <ReviewsSection restaurantId={restaurant.id} restaurantName={restaurant.name} restaurantSlug={restaurant.slug} />
              </div>
            </div>

            {/* Sidebar - desktop only */}
            <div className="hidden lg:block space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
                <h3 className="font-display font-semibold text-lg mb-4">Visit</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{restaurant.address}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.neighborhood}, {restaurant.city}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="text-success font-medium text-sm">Open Now</span>
                  </div>

                  {restaurant.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <a href={`tel:${restaurant.phone}`} className="hover:text-primary transition-colors text-sm">
                        {restaurant.phone}
                      </a>
                    </div>
                  )}

                  {restaurant.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-primary" />
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors truncate text-sm">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Button variant="hero" size="lg" className="w-full gap-2" onClick={handleGetDirections}>
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </Button>
                  <SidebarSaveButton restaurantId={restaurant.id} />
                  <ClaimRestaurant restaurantId={restaurant.id} restaurantName={restaurant.name} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile contact info */}
        <div className="lg:hidden border-t border-border bg-card px-4 py-4">
          <div className="max-w-6xl mx-auto flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate">{restaurant.address}</span>
            </div>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Phone className="w-4 h-4 text-primary" />
                {restaurant.phone}
              </a>
            )}
            <ClaimRestaurant restaurantId={restaurant.id} restaurantName={restaurant.name} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
