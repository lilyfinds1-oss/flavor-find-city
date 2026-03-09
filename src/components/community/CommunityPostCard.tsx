import { Link } from "react-router-dom";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Store, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useVotePost } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface Props {
  post: any;
}

export function CommunityPostCard({ post }: Props) {
  const { user } = useAuth();
  const voteMutation = useVotePost();
  const profile = post.profiles;
  const category = post.community_categories;
  const restaurant = post.restaurants;

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 hover:border-border transition-colors">
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <button
            onClick={() => user && voteMutation.mutate({ postId: post.id, voteType: "upvote" })}
            className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowBigUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">{post.votes || 0}</span>
          <button
            onClick={() => user && voteMutation.mutate({ postId: post.id, voteType: "downvote" })}
            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <ArrowBigDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            {post.dish_tag && (
              <Badge variant="outline" className="text-xs">
                🍽️ {post.dish_tag}
              </Badge>
            )}
          </div>

          <Link to={`/community/post/${post.id}`} className="block group">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
          </Link>

          {restaurant && (
            <Link to={`/restaurant/${restaurant.slug}`} className="flex items-center gap-1.5 mt-2 text-xs text-primary hover:underline">
              <Store className="w-3 h-3" />
              {restaurant.name}
            </Link>
          )}

          {post.image_url && (
            <img src={post.image_url} alt="" className="mt-2 rounded-xl max-h-48 object-cover w-full" />
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="text-[10px] bg-muted">{profile?.display_name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <span>{profile?.display_name || "Anonymous"}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {post.comment_count || 0}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
