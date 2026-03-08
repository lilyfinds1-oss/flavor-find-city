import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChefHat, Megaphone, Sparkles, CreditCard, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMySubscriptions, useMyClaimedRestaurants } from "@/hooks/useSubscription";
import { SEOHead } from "@/components/seo/SEOHead";

export default function AIToolsDashboard() {
  const { user } = useAuth();
  const { data: subscriptions, isLoading: subsLoading } = useMySubscriptions();
  const { data: restaurants, isLoading: restLoading } = useMyClaimedRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

  const activeSubs = subscriptions?.filter((s: any) => s.status === "active") || [];
  const selectedSub = activeSubs.find((s: any) => s.restaurant_id === selectedRestaurantId);

  const isLoading = subsLoading || restLoading;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Sign in to access AI Tools</h1>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="AI Tools — CityBites" description="Premium AI tools for restaurant owners." />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">AI Tools</h1>
            <p className="text-muted-foreground text-sm">Premium AI-powered tools for your restaurant</p>
          </div>
        </div>

        {/* Restaurant selector */}
        {activeSubs.length > 0 && (
          <div className="mb-8 max-w-xs">
            <Label className="mb-2 block text-sm">Active Restaurant</Label>
            <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
              <SelectTrigger><SelectValue placeholder="Select restaurant" /></SelectTrigger>
              <SelectContent>
                {activeSubs.map((s: any) => (
                  <SelectItem key={s.restaurant_id} value={s.restaurant_id}>
                    {s.restaurants?.name || "Restaurant"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSub && (
              <Badge variant="secondary" className="mt-2">
                {selectedSub.plan_name === "growth" ? "Growth" : "Starter"} Plan
              </Badge>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {[1, 2].map(i => <div key={i} className="h-48 rounded-xl shimmer" />)}
          </div>
        ) : activeSubs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Active Subscriptions</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Claim a restaurant and subscribe to a plan to unlock AI-powered tools.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/pricing">
                  <Button className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    View Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <CardTitle>AI Marketing Assistant</CardTitle>
                <CardDescription>Generate Instagram, Facebook, and ad content for your restaurant</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={selectedRestaurantId ? `/marketing-assistant?restaurant=${selectedRestaurantId}` : "#"}>
                  <Button className="gap-2 w-full" disabled={!selectedRestaurantId}>
                    Open Marketing Assistant
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className={`hover:shadow-md transition-shadow ${selectedSub?.plan_name !== "growth" ? "opacity-60" : ""}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                  </div>
                  {selectedSub?.plan_name !== "growth" && (
                    <Badge variant="secondary" className="text-xs">Growth Plan</Badge>
                  )}
                </div>
                <CardTitle>AI Menu Intelligence</CardTitle>
                <CardDescription>Upload a menu to auto-extract dishes, categories, and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSub?.plan_name === "growth" ? (
                  <Link to={selectedRestaurantId ? `/menu-analyzer?restaurant=${selectedRestaurantId}` : "#"}>
                    <Button className="gap-2 w-full" disabled={!selectedRestaurantId}>
                      Open Menu Analyzer
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/pricing">
                    <Button variant="outline" className="gap-2 w-full">
                      Upgrade to Growth
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Billing link */}
        {activeSubs.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/billing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Manage Billing & Subscriptions →
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
