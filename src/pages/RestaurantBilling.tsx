import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, ArrowRight, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMySubscriptions } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { SEOHead } from "@/components/seo/SEOHead";

export default function RestaurantBilling() {
  const { user } = useAuth();
  const { data: subscriptions, isLoading } = useMySubscriptions();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Sign in to view billing</h1>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Billing — CityBites" description="Manage your restaurant subscriptions." />
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Billing & Subscriptions</h1>
            <p className="text-muted-foreground text-sm">Manage your restaurant plans</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-32 rounded-xl shimmer" />)}
          </div>
        ) : !subscriptions || subscriptions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <h2 className="text-lg font-semibold mb-2">No Active Subscriptions</h2>
              <p className="text-muted-foreground text-sm mb-6">Subscribe to unlock AI tools for your restaurant.</p>
              <Link to="/pricing"><Button className="gap-2"><Sparkles className="w-4 h-4" />View Plans</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub: any) => (
              <Card key={sub.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{sub.restaurants?.name || "Restaurant"}</CardTitle>
                      <CardDescription>{sub.restaurants?.cuisines?.join(", ")}</CardDescription>
                    </div>
                    <div className="text-right">
                      <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                        {sub.status === "active" ? "Active" : sub.status}
                      </Badge>
                      <p className="text-sm font-semibold mt-1 capitalize">{sub.plan_name} Plan</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {sub.current_period_end
                          ? `Renews ${format(new Date(sub.current_period_end), "MMM d, yyyy")}`
                          : "No renewal date"}
                      </div>
                      <span>{sub.plan_name === "growth" ? "$39/mo" : "$19/mo"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/ai-tools`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          AI Tools <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
