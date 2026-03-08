import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Lock, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMyClaimedRestaurants } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SEOHead } from "@/components/seo/SEOHead";

export default function RestaurantSubscribe() {
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get("plan") || "starter";
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: restaurants, isLoading } = useMyClaimedRestaurants();

  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(planFromUrl);
  const [subscribing, setSubscribing] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubscribe = async () => {
    if (!selectedRestaurant) {
      toast.error("Please select a restaurant");
      return;
    }

    setSubscribing(true);
    try {
      // For now, create a subscription record directly
      // Stripe checkout will be wired when Stripe keys are configured
      const { error } = await supabase.from("restaurant_subscriptions").insert({
        restaurant_id: selectedRestaurant,
        user_id: user.id,
        plan_name: selectedPlan,
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This restaurant already has an active subscription");
        } else {
          throw error;
        }
      } else {
        toast.success(`${selectedPlan === "growth" ? "Growth" : "Starter"} plan activated!`);
        navigate("/ai-tools");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to subscribe");
    } finally {
      setSubscribing(false);
    }
  };

  const planDetails = selectedPlan === "growth"
    ? { name: "Growth", price: "$39/mo", features: ["AI Marketing Assistant", "AI Menu Intelligence", "Unlimited AI generations"] }
    : { name: "Starter", price: "$19/mo", features: ["AI Marketing Assistant", "5 AI generations/day"] };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Subscribe — CityBites" description="Subscribe to unlock AI tools for your restaurant." />
      <Header />

      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Subscribe to {planDetails.name}</h1>
          <p className="text-muted-foreground">Select your restaurant and activate AI tools</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {planDetails.name} Plan
              <Badge>{planDetails.price}</Badge>
            </CardTitle>
            <CardDescription>
              {planDetails.features.join(" • ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter — $19/mo</SelectItem>
                  <SelectItem value="growth">Growth — $39/mo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Restaurant</Label>
              {isLoading ? (
                <div className="h-10 rounded-md shimmer" />
              ) : restaurants && restaurants.length > 0 ? (
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger><SelectValue placeholder="Select a restaurant" /></SelectTrigger>
                  <SelectContent>
                    {restaurants.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-4 rounded-lg border border-dashed text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    You need to claim a restaurant first
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/explore")}>
                    Find Your Restaurant
                  </Button>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Stripe checkout will be available once configured. For now, subscriptions activate instantly.</span>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleSubscribe}
              disabled={subscribing || !selectedRestaurant}
            >
              <Sparkles className="w-4 h-4" />
              {subscribing ? "Activating..." : `Activate ${planDetails.name} Plan`}
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
