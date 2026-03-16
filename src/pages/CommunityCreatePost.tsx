import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCommunityCategories, useCreatePost } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurants } from "@/hooks/useRestaurants";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

export default function CommunityCreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: categories } = useCommunityCategories();
  const { data: restaurants } = useRestaurants();
  const createPost = useCreatePost();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [dishTag, setDishTag] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!user) {
    return (
      <PageTransition>
        <Header />
        <main className="container py-16 text-center min-h-screen">
          <h2 className="text-xl font-semibold text-foreground">Sign in to create a post</h2>
          <Link to="/auth"><Button className="mt-4">Sign In</Button></Link>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) return;

    let imageUrl: string | undefined;
    if (imageFile) {
      setUploading(true);
      const ext = imageFile.name.split(".").pop();
      const path = `community/${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("review-photos").upload(path, imageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from("review-photos").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
      setUploading(false);
    }

    createPost.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        restaurant_id: restaurantId && restaurantId !== "none" ? restaurantId : undefined,
        dish_tag: dishTag.trim() || undefined,
        image_url: imageUrl,
        user_id: user.id,
      },
      { onSuccess: () => navigate("/community") }
    );
  };

  return (
    <PageTransition>
      <Header />
      <main className="container py-8 max-w-2xl min-h-screen">
        <Link to="/community" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>

        <h1 className="text-2xl font-display font-bold text-foreground mb-6">Create Post</h1>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="What's on your mind?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <Textarea placeholder="Share your thoughts..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[120px]" />
          </div>

          <div className="space-y-2">
            <Label>Tag Restaurant (optional)</Label>
            <Select value={restaurantId} onValueChange={setRestaurantId}>
              <SelectTrigger><SelectValue placeholder="Link a restaurant" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {restaurants?.slice(0, 50).map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Dish Tag (optional)</Label>
            <Input placeholder="e.g. Chicken Biryani" value={dishTag} onChange={(e) => setDishTag(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 object-cover" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload a photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </label>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || !categoryId || createPost.isPending || uploading}
            className="w-full"
          >
            {uploading ? "Uploading..." : createPost.isPending ? "Posting..." : "Post Discussion"}
          </Button>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
