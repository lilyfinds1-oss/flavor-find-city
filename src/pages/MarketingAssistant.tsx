import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Loader2, Sparkles, Instagram, Facebook, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { UpgradeModal } from "@/components/premium/UpgradeModal";
import { toast } from "sonner";
import { SEOHead } from "@/components/seo/SEOHead";

export default function MarketingAssistant() {
  const [searchParams] = useSearchParams();
  const restaurantId = searchParams.get("restaurant") || "";
  const { data: subscription } = useSubscription(restaurantId);

  const [specialDish, setSpecialDish] = useState("");
  const [promotionType, setPromotionType] = useState("general");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<any>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleGenerate = async () => {
    if (!subscription) {
      setShowUpgrade(true);
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-restaurant-marketing", {
        body: {
          restaurant_id: restaurantId,
          content_type: "all",
          special_dish: specialDish,
          promotion_type: promotionType,
          custom_prompt: customPrompt,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setContent(data.content);
      toast.success("Marketing content generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Marketing Assistant — CityBites AI" description="AI-powered social media content for restaurants." />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">AI Marketing Assistant</h1>
            <p className="text-muted-foreground text-sm">Generate social media content for your restaurant</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Generate Content</CardTitle>
              <CardDescription>Customize your marketing message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Promotion Type</Label>
                <Select value={promotionType} onValueChange={setPromotionType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Post</SelectItem>
                    <SelectItem value="weekend_special">Weekend Special</SelectItem>
                    <SelectItem value="new_dish">New Dish Launch</SelectItem>
                    <SelectItem value="event">Event Announcement</SelectItem>
                    <SelectItem value="discount">Discount / Offer</SelectItem>
                    <SelectItem value="festive">Festive Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Featured Dish (optional)</Label>
                <Input
                  placeholder="e.g. Chicken Karahi"
                  value={specialDish}
                  onChange={(e) => setSpecialDish(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes (optional)</Label>
                <Textarea
                  placeholder="Any specific details..."
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
              </div>

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? "Generating..." : "Generate Content"}
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            {!content ? (
              <Card className="py-16">
                <CardContent className="text-center">
                  <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">Generated content will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <ContentCard
                  title="Instagram Caption"
                  icon={<Instagram className="w-4 h-4" />}
                  content={content.instagram_caption}
                  copied={copiedField === "instagram"}
                  onCopy={() => copyToClipboard(content.instagram_caption, "instagram")}
                />
                <ContentCard
                  title="Facebook Post"
                  icon={<Facebook className="w-4 h-4" />}
                  content={content.facebook_post}
                  copied={copiedField === "facebook"}
                  onCopy={() => copyToClipboard(content.facebook_post, "facebook")}
                />
                <ContentCard
                  title="Short Ad Copy"
                  icon={<Sparkles className="w-4 h-4" />}
                  content={content.short_ad_copy}
                  copied={copiedField === "ad"}
                  onCopy={() => copyToClipboard(content.short_ad_copy, "ad")}
                />
                {content.event_announcement && (
                  <ContentCard
                    title="Event Announcement"
                    icon={<Megaphone className="w-4 h-4" />}
                    content={content.event_announcement}
                    copied={copiedField === "event"}
                    onCopy={() => copyToClipboard(content.event_announcement, "event")}
                  />
                )}
                {content.hashtags && (
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium mb-2">Hashtags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {content.hashtags.map((h: string) => (
                          <Badge key={h} variant="secondary" className="text-xs">#{h.replace("#", "")}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </div>
  );
}

function ContentCard({ title, icon, content, copied, onCopy }: {
  title: string;
  icon: React.ReactNode;
  content: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </div>
          <Button variant="ghost" size="sm" onClick={onCopy} className="gap-1.5 h-7 text-xs">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>
      </CardContent>
    </Card>
  );
}
