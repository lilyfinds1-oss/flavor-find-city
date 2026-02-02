import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Star, ThumbsUp, Calendar, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Link } from "react-router-dom";

interface TopReview {
  id: string;
  title: string | null;
  content: string;
  rating: number;
  helpful_votes: number | null;
  created_at: string | null;
  user_id: string;
  restaurant_id: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    username: string | null;
  } | null;
  restaurants: {
    name: string;
    slug: string;
    cover_image: string | null;
  } | null;
}

export default function TopPosts() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const getMonthRange = (monthStr: string) => {
    const [year, month] = monthStr.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return {
      start: startOfMonth(date).toISOString(),
      end: endOfMonth(date).toISOString(),
    };
  };

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["top-posts", selectedMonth],
    queryFn: async () => {
      const { start, end } = getMonthRange(selectedMonth);
      
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          title,
          content,
          rating,
          helpful_votes,
          created_at,
          user_id,
          restaurant_id,
          profiles!reviews_user_id_fkey (
            display_name,
            avatar_url,
            username
          ),
          restaurants!reviews_restaurant_id_fkey (
            name,
            slug,
            cover_image
          )
        `)
        .eq("status", "approved")
        .gte("created_at", start)
        .lte("created_at", end)
        .order("helpful_votes", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as unknown as TopReview[];
    },
  });

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = subMonths(now, i);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }
    return options;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-amber-400 to-amber-600 text-white";
    if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-500 text-white";
    if (rank === 3) return "bg-gradient-to-br from-amber-600 to-amber-800 text-white";
    return "bg-secondary text-foreground";
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Trophy className="w-4 h-4" />;
    return null;
  };

  const formatMonthLabel = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return format(new Date(year, month - 1, 1), "MMMM yyyy");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Trophy className="w-5 h-5" />
            <span className="font-medium">Top Reviews</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Monthly Top Posts
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            The most helpful and engaging food reviews from our community, ranked by votes.
          </p>

          {/* Month Selector */}
          <div className="flex items-center justify-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, index) => {
              const rank = index + 1;
              const authorName = review.profiles?.display_name || review.profiles?.username || "Anonymous";
              
              return (
                <Card key={review.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankStyle(rank)}`}>
                        {getRankIcon(rank) || `#${rank}`}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <Link 
                              to={`/restaurant/${review.restaurants?.slug}`}
                              className="font-semibold text-lg hover:text-primary transition-colors"
                            >
                              {review.restaurants?.name}
                            </Link>
                            {review.title && (
                              <h3 className="font-medium text-foreground">{review.title}</h3>
                            )}
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="font-bold text-primary">{review.rating}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground line-clamp-2 mb-3">
                          {review.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={review.profiles?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {authorName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{authorName}</span>
                            {review.created_at && (
                              <span className="text-sm text-muted-foreground">
                                • {format(new Date(review.created_at), "MMM d, yyyy")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-green-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-medium">{review.helpful_votes || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-4">
                No reviews were posted in {formatMonthLabel()}.
              </p>
              <Link to="/explore">
                <Button>Explore Restaurants</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
