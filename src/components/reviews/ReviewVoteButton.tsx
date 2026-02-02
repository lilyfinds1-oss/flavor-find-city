import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewVoteButtonProps {
  reviewId: string;
  initialHelpfulVotes?: number;
}

export function ReviewVoteButton({ reviewId, initialHelpfulVotes = 0 }: ReviewVoteButtonProps) {
  const { user } = useAuth();
  const [helpfulVotes, setHelpfulVotes] = useState(initialHelpfulVotes);
  const [userVote, setUserVote] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserVote();
    }
  }, [user, reviewId]);

  const fetchUserVote = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("review_votes")
      .select("is_helpful")
      .eq("review_id", reviewId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setUserVote(data.is_helpful);
    }
  };

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    setLoading(true);

    try {
      if (userVote === isHelpful) {
        // Remove vote
        const { error } = await supabase
          .from("review_votes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);

        if (error) throw error;
        
        setUserVote(null);
        setHelpfulVotes((prev) => prev + (isHelpful ? -1 : 1));
      } else if (userVote !== null) {
        // Change vote
        const { error } = await supabase
          .from("review_votes")
          .update({ is_helpful: isHelpful })
          .eq("review_id", reviewId)
          .eq("user_id", user.id);

        if (error) throw error;
        
        setUserVote(isHelpful);
        setHelpfulVotes((prev) => prev + (isHelpful ? 2 : -2));
      } else {
        // New vote
        const { error } = await supabase
          .from("review_votes")
          .insert({
            review_id: reviewId,
            user_id: user.id,
            is_helpful: isHelpful,
          });

        if (error) throw error;
        
        setUserVote(isHelpful);
        setHelpfulVotes((prev) => prev + (isHelpful ? 1 : -1));
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleVote(true)}
        className={cn(
          "gap-1",
          userVote === true && "text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700"
        )}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ThumbsUp className={cn("w-4 h-4", userVote === true && "fill-current")} />
        )}
        <span>{helpfulVotes}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => handleVote(false)}
        className={cn(
          "gap-1",
          userVote === false && "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700"
        )}
      >
        <ThumbsDown className={cn("w-4 h-4", userVote === false && "fill-current")} />
      </Button>
    </div>
  );
}
