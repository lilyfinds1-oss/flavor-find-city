import { useState, useRef } from "react";
import { Camera, Loader2, Sparkles, MapPin, Star, ChevronRight, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface DishResult {
  dish_name: string;
  cuisine_type: string;
  ingredients_guess: string[];
  confidence: number;
  description: string;
}

interface MatchedRestaurant {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  cuisines: string[];
  price_range: string;
  average_rating: number;
  cover_image: string;
  total_reviews: number;
}

export function DishScanner() {
  const [scanning, setScanning] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dish, setDish] = useState<DishResult | null>(null);
  const [restaurants, setRestaurants] = useState<MatchedRestaurant[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Convert to base64
    setScanning(true);
    setDish(null);
    setRestaurants([]);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      const { data, error } = await supabase.functions.invoke("ai-dish-recognition", {
        body: { imageBase64: base64, mimeType: file.type },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDish(data.dish);
      setRestaurants(data.nearby_restaurants || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to scan dish");
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setDish(null);
    setRestaurants([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Scan a Dish</h3>
      </div>
      <p className="text-sm text-muted-foreground">Upload a food photo and AI will identify the dish and find restaurants serving it</p>

      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
          <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Tap to upload a food photo</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img src={preview} alt="Uploaded food" className="w-full h-48 object-cover rounded-2xl" />
            <Button
              variant="glass"
              size="icon"
              className="absolute top-2 right-2 w-8 h-8"
              onClick={reset}
            >
              <X className="w-4 h-4" />
            </Button>
            {scanning && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Analyzing with AI...</span>
                </div>
              </div>
            )}
          </div>

          {dish && dish.dish_name !== "Not food" && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display text-lg font-bold">{dish.dish_name}</h4>
                    <p className="text-sm text-muted-foreground">{dish.cuisine_type} Cuisine</p>
                  </div>
                  <Badge variant="default" className="text-xs">
                    {Math.round(dish.confidence * 100)}% match
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{dish.description}</p>
                {dish.ingredients_guess?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dish.ingredients_guess.map((ing) => (
                      <Badge key={ing} variant="outline" className="text-xs">{ing}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {dish && dish.dish_name === "Not food" && (
            <p className="text-sm text-destructive text-center py-4">
              This doesn't appear to be food. Try uploading a different photo!
            </p>
          )}

          {restaurants.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Restaurants serving similar dishes</h4>
              {restaurants.map((r) => (
                <Link key={r.id} to={`/restaurant/${r.slug}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <img
                      src={r.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop"}
                      alt={r.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{r.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{r.neighborhood}</span>
                        <Star className="w-3 h-3 fill-amber text-amber" />
                        <span>{Number(r.average_rating).toFixed(1)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
