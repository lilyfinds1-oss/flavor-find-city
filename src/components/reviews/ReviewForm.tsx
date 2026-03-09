import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Send, Loader2, Lock, ImagePlus, X } from "lucide-react";
import { Link } from "react-router-dom";

interface ReviewFormProps {
  restaurantId: string;
  restaurantName: string;
  onSuccess?: () => void;
}

export function ReviewForm({ restaurantId, restaurantName, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const canWriteReview = !!user; // All authenticated users can write reviews

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photoFiles.length + files.length > 5) {
      toast.error("Maximum 5 photos per review");
      return;
    }
    const validFiles = files.filter((f) => {
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    setPhotoFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (!user || photoFiles.length === 0) return [];
    const urls: string[] = [];
    for (const file of photoFiles) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("review-photos").upload(path, file);
      if (error) {
        console.error("Upload error:", error);
        continue;
      }
      const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to submit a review"); return; }
    if (!canWriteReview) { toast.error("You don't have permission to write reviews"); return; }
    if (rating === 0) { toast.error("Please select a rating"); return; }
    if (content.trim().length < 20) { toast.error("Review must be at least 20 characters"); return; }

    setSubmitting(true);

    const photoUrls = await uploadPhotos();

    const { data: reviewData, error } = await supabase.from("reviews").insert({
      restaurant_id: restaurantId,
      user_id: user.id,
      title: title.trim() || null,
      content: content.trim(),
      rating,
      photos: photoUrls.length > 0 ? photoUrls : null,
      status: "pending",
    }).select("id").single();

    if (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } else {
      toast.success("Review submitted! It will appear after a quick AI quality check.");
      setTitle("");
      setContent("");
      setRating(0);
      setPhotoFiles([]);
      setPhotoPreviews([]);
      onSuccess?.();

      // Trigger AI moderation asynchronously
      if (reviewData?.id) {
        supabase.functions.invoke("ai-moderate-review", {
          body: {
            reviewId: reviewData.id,
            title: title.trim() || null,
            content: content.trim(),
            rating,
            restaurantName,
          },
        }).catch((err) => console.error("AI moderation error:", err));
      }
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign in to Review</h3>
          <p className="text-muted-foreground mb-4">Join our community to share your food experiences</p>
          <Link to="/auth"><Button>Sign In</Button></Link>
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
          <p className="text-muted-foreground mb-4">Only approved writers can submit reviews.</p>
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
                  <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Title (Optional)</Label>
            <Input id="review-title" placeholder="Summarize your experience" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review *</Label>
            <Textarea id="review-content" placeholder="Share the details of your experience..." value={content} onChange={(e) => setContent(e.target.value)} rows={5} maxLength={2000} />
            <p className="text-xs text-muted-foreground text-right">{content.length}/2000 characters (minimum 20)</p>
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <div className="flex flex-wrap gap-3">
              {photoPreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                  <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photoFiles.length < 5 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
                  <ImagePlus className="w-6 h-6 text-muted-foreground" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Up to 5 photos, max 5MB each</p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
