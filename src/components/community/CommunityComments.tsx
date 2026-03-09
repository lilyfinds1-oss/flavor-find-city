import { useState } from "react";
import { useCommunityComments, useCreateComment, useDeleteComment } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  postId: string;
}

export function CommunityComments({ postId }: Props) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useCommunityComments(postId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!content.trim() || !user) return;
    createComment.mutate(
      { post_id: postId, user_id: user.id, content: content.trim(), parent_id: replyTo || undefined },
      { onSuccess: () => { setContent(""); setReplyTo(null); } }
    );
  };

  const topLevel = comments?.filter((c) => !c.parent_id) || [];
  const replies = (parentId: string) => comments?.filter((c) => c.parent_id === parentId) || [];

  const renderComment = (comment: any, depth = 0) => {
    const profile = comment.profiles;
    return (
      <div key={comment.id} className={`${depth > 0 ? "ml-8 border-l-2 border-border/30 pl-4" : ""}`}>
        <div className="py-3">
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-[10px] bg-muted">{profile?.display_name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{profile?.display_name || "Anonymous"}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-foreground/90 ml-8">{comment.content}</p>
          <div className="flex items-center gap-2 ml-8 mt-1">
            {user && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
            )}
            {user?.id === comment.user_id && (
              <button
                onClick={() => deleteComment.mutate({ commentId: comment.id, postId })}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        </div>
        {replies(comment.id).map((r: any) => renderComment(r, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-foreground">Comments</h3>

      {user ? (
        <div className="space-y-2">
          {replyTo && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              Replying to comment
              <button onClick={() => setReplyTo(null)} className="text-primary hover:underline">Cancel</button>
            </div>
          )}
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60px] bg-muted/50"
          />
          <Button size="sm" onClick={handleSubmit} disabled={!content.trim() || createComment.isPending}>
            {createComment.isPending ? "Posting..." : "Comment"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to comment.</p>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl shimmer" />)}</div>
      ) : topLevel.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">No comments yet. Be the first!</p>
      ) : (
        topLevel.map((c: any) => renderComment(c))
      )}
    </div>
  );
}
