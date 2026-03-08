import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChefHat, Upload, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "@/components/premium/UpgradeModal";
import { toast } from "sonner";
import { SEOHead } from "@/components/seo/SEOHead";

export default function MenuAnalyzer() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant") || "";
  const { data: subscription } = useSubscription(restaurantId);

  const [menuText, setMenuText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dishes, setDishes] = useState<any[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleParse = async () => {
    if (!subscription || subscription.plan_name !== "growth") {
      setShowUpgrade(true);
      return;
    }

    if (!menuText.trim() && !imageFile) {
      toast.error("Please enter menu text or upload an image");
      return;
    }

    setParsing(true);
    try {
      let body: any = { restaurant_id: restaurantId };

      if (imageFile) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(imageFile);
        });
        body.menu_image_base64 = base64;
        body.menu_image_mime = imageFile.type;
      } else {
        body.menu_text = menuText;
      }

      const { data, error } = await supabase.functions.invoke("ai-menu-parser", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setDishes(data.dishes || []);
      toast.success(`Extracted ${data.count} dishes from menu!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to parse menu");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Menu Analyzer — CityBites AI" description="AI-powered menu parsing." />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <ChefHat className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">AI Menu Analyzer</h1>
            <p className="text-muted-foreground text-sm">Extract dishes from menus using AI vision</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Menu</CardTitle>
              <CardDescription>Paste menu text or upload a menu image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your menu text here...&#10;&#10;Example:&#10;Chicken Biryani — Rs. 450&#10;Seekh Kebab — Rs. 350&#10;Nihari — Rs. 500"
                rows={8}
                value={menuText}
                onChange={(e) => setMenuText(e.target.value)}
                disabled={!!imageFile}
              />

              <div className="relative">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setMenuText("");
                      }
                    }}
                  />
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {imageFile ? imageFile.name : "Drop menu image or click to upload"}
                  </p>
                </div>
                {imageFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setImageFile(null)}
                  >
                    Remove image
                  </Button>
                )}
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleParse}
                disabled={parsing || (!menuText.trim() && !imageFile)}
              >
                {parsing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {parsing ? "Analyzing Menu..." : "Extract Dishes with AI"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Extracted Dishes
                {dishes.length > 0 && <Badge>{dishes.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dishes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Parsed dishes will appear here</p>
                </div>
              ) : (
                <div className="max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dish</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Spice</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dishes.map((dish, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            {dish.dish_name}
                            {dish.dietary_tags?.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {dish.dietary_tags.map((t: string) => (
                                  <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{dish.category}</TableCell>
                          <TableCell className="text-sm">{dish.ai_spice_level}</TableCell>
                          <TableCell className="text-sm">{dish.price ? `Rs. ${dish.price}` : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}
