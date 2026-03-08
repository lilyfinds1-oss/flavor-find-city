import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminReviews, useUpdateReviewStatus } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, Star, MessageSquare, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ReviewStatus = Database["public"]["Enums"]["review_status"];

export default function ReviewModerator() {
  const [activeTab, setActiveTab] = useState<ReviewStatus | "all">("pending");
  const { data: reviews, isLoading } = useAdminReviews(activeTab === "all" ? undefined : activeTab);
  const updateStatus = useUpdateReviewStatus();
  const { toast } = useToast();

  const handleStatusChange = async (id: string, status: ReviewStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast({
        title: status === "approved" ? "Review approved" : "Review rejected",
        description: "The review status has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Review Moderation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReviewStatus | "all")}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <Check className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <X className="w-4 h-4" />
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {reviews?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {activeTab !== "all" ? activeTab : ""} reviews found</p>
              </div>
            ) : (
              reviews?.map((review: any) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.profiles?.avatar_url} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {review.profiles?.display_name || review.profiles?.username || "Anonymous"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/restaurant/${review.restaurants?.slug}`}
                      className="text-primary hover:underline font-medium"
                    >
                      {review.restaurants?.name}
                    </Link>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold">{review.title}</h4>
                  )}
                  <p className="text-sm">{review.content}</p>

                  {review.photos?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {review.photos.map((photo: string, i: number) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`Review photo ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* AI Moderation Info */}
                  {(review.ai_quality_score != null || review.ai_moderation_notes) && (
                    <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs uppercase tracking-wider text-muted-foreground">AI Assessment</span>
                        {review.ai_quality_score != null && (
                          <Badge variant={review.ai_quality_score >= 70 ? "default" : review.ai_quality_score >= 40 ? "secondary" : "destructive"} className="text-xs">
                            Score: {review.ai_quality_score}/100
                          </Badge>
                        )}
                      </div>
                      {review.ai_moderation_notes && (
                        <p className="text-muted-foreground text-xs">{review.ai_moderation_notes}</p>
                      )}
                    </div>
                  )}

                  {review.status === "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(review.id, "approved")}
                        disabled={updateStatus.isPending}
                        className="gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(review.id, "rejected")}
                        disabled={updateStatus.isPending}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {review.status !== "pending" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(review.id, "pending")}
                        disabled={updateStatus.isPending}
                      >
                        Reset to Pending
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
