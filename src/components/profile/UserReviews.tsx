import { Link } from "react-router-dom";
import { MessageSquare, Star, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

export function UserReviews() {
  const { user } = useAuth();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["user-reviews", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, restaurants(name, slug)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <Card className="md:col-span-3">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          My Reviews ({reviews?.length || 0})
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your recent restaurant reviews</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review: any) => (
              <Link
                key={review.id}
                to={`/restaurant/${review.restaurants?.slug}`}
                className="block p-4 rounded-xl border border-border hover:border-primary/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{review.restaurants?.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating ? "text-amber fill-amber" : "text-muted-foreground/30"}`}
                          />
                        ))}
                      </div>
                      <Badge
                        variant={review.status === "approved" ? "default" : review.status === "rejected" ? "destructive" : "secondary"}
                        className="text-[10px] h-5"
                      >
                        {review.status}
                      </Badge>
                    </div>
                    {review.title && <p className="text-xs text-muted-foreground mt-1 truncate">{review.title}</p>}
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{review.content}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">No reviews yet</p>
            <Link to="/explore" className="text-sm text-primary font-medium hover:underline">
              Find a restaurant to review →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
