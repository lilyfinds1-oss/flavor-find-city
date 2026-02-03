import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Star, TrendingUp, Calendar, MessageSquare } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
    is_verified_foodie: boolean | null;
  } | null;
  restaurants: {
    name: string;
    slug: string;
    cover_image: string | null;
    neighborhood: string | null;
  } | null;
}

const rankStyles: Record<number, string> = {
  1: "bg-gradient-gold shadow-accent",
  2: "bg-gradient-to-br from-slate-300 to-slate-400",
  3: "bg-gradient-to-br from-amber-600 to-amber-700",
};

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
            username,
            is_verified_foodie
          ),
          restaurants!reviews_restaurant_id_fkey (
            name,
            slug,
            cover_image,
            neighborhood
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

  const formatMonthLabel = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return format(new Date(year, month - 1, 1), "MMMM yyyy");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 px-4 border-b border-border/30">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
          
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4 animate-fade-in">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">Monthly Rankings</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 animate-fade-in-up">
              Top <span className="gradient-text-gold">Reviews</span>
            </h1>
            <p className="text-muted-foreground mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              The most helpful reviews from our community
            </p>

            {/* Month Selector */}
            <div className="flex items-center justify-center animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48 glass border-border/50">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/50">
                  {generateMonthOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Reviews List */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl shimmer" />
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, index) => {
                  const rank = index + 1;
                  const authorName = review.profiles?.display_name || review.profiles?.username || "Anonymous";
                  
                  return (
                    <article
                      key={review.id}
                      className={cn(
                        "feed-item group relative rounded-2xl overflow-hidden transition-all duration-300",
                        "bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg",
                        rank <= 3 && "border-l-4",
                        rank === 1 && "border-l-accent",
                        rank === 2 && "border-l-slate-400",
                        rank === 3 && "border-l-amber-600"
                      )}
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="flex gap-4 p-4">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-lg",
                            rank <= 3 ? `${rankStyles[rank]} text-charcoal` : "bg-muted text-muted-foreground"
                          )}>
                            {rank <= 3 ? <Trophy className="w-5 h-5" /> : `#${rank}`}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <Link 
                                to={`/restaurant/${review.restaurants?.slug}`}
                                className="font-display font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                              >
                                {review.title || review.restaurants?.name}
                              </Link>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                <span>{review.restaurants?.name}</span>
                                {review.restaurants?.neighborhood && (
                                  <>
                                    <span>•</span>
                                    <span>{review.restaurants.neighborhood}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-success/10 text-success">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span className="font-semibold text-sm">{review.helpful_votes || 0}</span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {review.content}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6 border border-border">
                                <AvatarImage src={review.profiles?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs bg-muted">
                                  {authorName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-muted-foreground">{authorName}</span>
                              {review.profiles?.is_verified_foodie && (
                                <span className="text-xs text-primary">✓</span>
                              )}
                              {review.created_at && (
                                <span className="text-sm text-muted-foreground">
                                  • {format(new Date(review.created_at), "MMM d")}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "w-3.5 h-3.5",
                                    i < review.rating ? "text-accent fill-accent" : "text-muted"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Restaurant image */}
                        {review.restaurants?.cover_image && (
                          <div className="flex-shrink-0 hidden sm:block">
                            <img
                              src={review.restaurants.cover_image}
                              alt={review.restaurants.name}
                              className="w-24 h-24 rounded-xl object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No reviews yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  No reviews were posted in {formatMonthLabel()}.
                </p>
                <Link to="/explore">
                  <Button variant="hero">Explore Restaurants</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
