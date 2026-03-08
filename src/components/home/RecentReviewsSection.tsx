import { Link } from "react-router-dom";
import { Star, ChevronRight, Quote } from "lucide-react";
import { useRecentReviews } from "@/hooks/useRecentReviews";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function RecentReviewsSection() {
  const { data: reviews, isLoading } = useRecentReviews(6);

  if (isLoading) {
    return (
      <section className="py-10 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Fresh Reviews</h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">What the community is saying</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-56 sm:h-64 rounded-2xl shimmer" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-12 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Fresh Reviews</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">What the community is saying</p>
          </div>
          <Link to="/top-posts">
            <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              View all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface ReviewCardProps {
  review: {
    id: string;
    title: string | null;
    content: string;
    rating: number;
    created_at: string | null;
    restaurant: {
      id: string;
      name: string;
      slug: string;
      cover_image: string | null;
      neighborhood: string | null;
    } | null;
    profile: {
      display_name: string | null;
      avatar_url: string | null;
      username: string | null;
    } | null;
  };
  index: number;
}

function ReviewCard({ review, index }: ReviewCardProps) {
  const timeAgo = review.created_at
    ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true })
    : "";

  return (
    <Link
      to={review.restaurant ? `/restaurant/${review.restaurant.slug}` : "#"}
      className={cn(
        "group relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1",
        "flex flex-col"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Restaurant image header */}
      {review.restaurant?.cover_image && (
        <div className="relative h-20 sm:h-24 overflow-hidden shrink-0">
          <img
            src={review.restaurant.cover_image}
            alt={review.restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
              {review.restaurant.name}
            </p>
            {review.restaurant.neighborhood && (
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {review.restaurant.neighborhood}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3 sm:w-4 sm:h-4",
                i < review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>

        {/* Review content */}
        <div className="relative mb-3 sm:mb-4 flex-1">
          <Quote className="absolute -top-1 -left-1 w-3 h-3 sm:w-4 sm:h-4 text-primary/20" />
          <p className="text-xs sm:text-sm text-foreground/80 line-clamp-3 pl-3 sm:pl-4">
            {review.title || review.content}
          </p>
        </div>

        {/* Author info */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border mt-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Avatar className="w-6 h-6 sm:w-7 sm:h-7 shrink-0">
              <AvatarImage src={review.profile?.avatar_url || undefined} />
              <AvatarFallback className="text-[10px] sm:text-xs bg-primary/10 text-primary">
                {(review.profile?.display_name || review.profile?.username || "U")[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] sm:text-xs font-medium text-foreground truncate">
              {review.profile?.display_name || review.profile?.username || "Anonymous"}
            </span>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0">{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
}
