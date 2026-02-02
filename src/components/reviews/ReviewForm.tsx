import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Send, Loader2, Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface ReviewFormProps {
  restaurantId: string;
  restaurantName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ restaurantId, restaurantName, onSuccess }: ReviewFormProps) {
  const { user, roles } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const canWriteReview = roles.includes("writer") || roles.includes("moderator") || roles.includes("admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit a review");
      return;
    }

    if (!canWriteReview) {
      toast.error("You don't have permission to write reviews");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (content.trim().length < 20) {
      toast.error("Review must be at least 20 characters");
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from("reviews")
      .insert({
        restaurant_id: restaurantId,
        user_id: user.id,
        title: title.trim() || null,
        content: content.trim(),
        rating,
        status: "approved", // Auto-approve for now, can be changed to "pending"
      });

    if (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted successfully!");
      setTitle("");
      setContent("");
      setRating(0);
      onSuccess?.();
    }
    
    setSubmitting(false);
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to Review</h3>
          <p className="text-muted-foreground mb-4">
            Join our community to share your food experiences
          </p>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!canWriteReview) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Writer Access Required</h3>
          <p className="text-muted-foreground mb-4">
            Only approved writers can submit reviews. You can still rate and vote on existing reviews.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>Share your experience at {restaurantName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Title (Optional)</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review *</Label>
            <Textarea
              id="review-content"
              placeholder="Share the details of your experience - the food, atmosphere, service..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/2000 characters (minimum 20)
            </p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
