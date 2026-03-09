import { Link } from "react-router-dom";
import { Gift, Clock, Ticket, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeals, useUserXP, useRedeemDeal } from "@/hooks/useDeals";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const getDealBadge = (dealType: string, discountValue: number | null) => {
  switch (dealType) {
    case "percentage":
      return `${discountValue}% OFF`;
    case "fixed":
      return `Rs. ${discountValue} OFF`;
    case "bogo":
      return "BOGO";
    case "free_item":
      return "FREE ITEM";
    default:
      return "DEAL";
  }
};

const defaultImages: Record<string, string> = {
  "The Smokehouse BBQ": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
  "Spice Garden": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
  "Sakura Sushi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop",
  "Mediterranean Grill": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
  "Nonna Rosa Trattoria": "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=400&h=300&fit=crop",
  "Seoul Kitchen": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop",
};

export default function Deals() {
  const { user } = useAuth();
  const { data: deals, isLoading } = useDeals();
  const { data: userXP = 0 } = useUserXP();
  const redeemDeal = useRedeemDeal();

  const handleRedeem = (dealId: string, xpCost: number) => {
    if (!user) return;
    redeemDeal.mutate({ dealId, xpCost });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Deals & Coupons" description="Redeem exclusive restaurant deals in Lahore using your XP points. Earn rewards by reviewing and voting." />
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-r from-amber/20 to-primary/20 border-b border-border">
          <div className="container py-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/30 text-amber-dark mb-4">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Exclusive Rewards</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Deals & Coupons
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use your XP points to unlock exclusive deals at top restaurants in Lahore. Earn more by reviewing and voting!
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-card rounded-full px-6 py-3 border border-border">
              <Ticket className="w-5 h-5 text-amber" />
              <span className="font-semibold">Your XP Balance:</span>
              <span className="text-2xl font-display font-bold text-amber">{userXP} XP</span>
              {!user && (
                <Link to="/auth">
                  <Button variant="gold" size="sm" className="ml-2">Sign in to earn</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex justify-between pt-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : deals && deals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {deals.map((deal) => {
                const restaurantName = deal.restaurant?.name || "Restaurant";
                const restaurantSlug = deal.restaurant?.slug || "";
                const coverImage = deal.restaurant?.cover_image || defaultImages[restaurantName] || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop";
                const canAfford = userXP >= (deal.xp_cost || 0);
                const expiresIn = deal.expires_at 
                  ? formatDistanceToNow(new Date(deal.expires_at), { addSuffix: false })
                  : "soon";

                return (
                  <div
                    key={deal.id}
                    className="group bg-card rounded-2xl border border-border/50 overflow-hidden card-hover"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={coverImage}
                        alt={restaurantName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-3 left-3 bg-gradient-gold text-charcoal font-bold border-0 text-sm">
                        {getDealBadge(deal.deal_type, deal.discount_value)}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <Link
                        to={`/restaurant/${restaurantSlug}`}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        {restaurantName}
                      </Link>
                      <h3 className="font-display font-semibold text-lg mt-1">{deal.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {deal.description || deal.terms}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-amber font-semibold">
                            <Ticket className="w-4 h-4" />
                            {deal.xp_cost} XP
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            {expiresIn}
                          </div>
                        </div>
                        {user ? (
                          <Button 
                            variant="gold" 
                            size="sm"
                            disabled={!canAfford || redeemDeal.isPending}
                            onClick={() => handleRedeem(deal.id, deal.xp_cost || 0)}
                          >
                            {redeemDeal.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : canAfford ? (
                              "Redeem"
                            ) : (
                              "Need more XP"
                            )}
                          </Button>
                        ) : (
                          <Link to="/auth">
                            <Button variant="gold" size="sm">Sign in</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">No active deals</h2>
              <p className="text-muted-foreground">Check back soon for exclusive offers!</p>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-secondary/30 border-t border-border">
          <div className="container py-12">
            <h2 className="font-display text-2xl font-bold text-center mb-8">How to Earn XP</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: "✍️", title: "Write Reviews", xp: "+50 XP", desc: "Share your dining experience" },
                { icon: "⬆️", title: "Vote for Restaurants", xp: "+10 XP", desc: "Help rank the best places" },
                { icon: "📸", title: "Upload Photos", xp: "+20 XP", desc: "Show off the food" },
              ].map((item, i) => (
                <div key={i} className="bg-card rounded-xl p-6 text-center border border-border">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-display font-semibold text-lg">{item.title}</h3>
                  <p className="text-amber font-bold mt-1">{item.xp}</p>
                  <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
