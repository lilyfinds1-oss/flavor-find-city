import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useMyClaimedRestaurants } from "@/hooks/useSubscription";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Ticket, Users, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo/SEOHead";
import { useState } from "react";

export default function MyDealAnalytics() {
  const { user } = useAuth();
  const { data: claimedRestaurants, isLoading: claimsLoading } = useMyClaimedRestaurants();
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("all");

  const { data: redemptions, isLoading: redemptionsLoading } = useQuery({
    queryKey: ["owner-deal-redemptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_redemptions")
        .select(`
          *,
          deal:deals!deal_redemptions_deal_id_fkey (title, deal_type, restaurant_id)
        `)
        .order("redeemed_at", { ascending: false });

      if (error) {
        const { data: fallback, error: fbErr } = await supabase
          .from("deal_redemptions")
          .select("*")
          .order("redeemed_at", { ascending: false });
        if (fbErr) throw fbErr;
        return (fallback || []).map((r: any) => ({ ...r, deal: null }));
      }
      return data || [];
    },
    enabled: !!user && (claimedRestaurants?.length || 0) > 0,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Sign in to view analytics</h1>
          <Link to="/auth"><Button>Sign In</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isLoading = claimsLoading || redemptionsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!claimedRestaurants || claimedRestaurants.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">No Claimed Restaurants</h1>
          <p className="text-muted-foreground mb-6">You need to claim a restaurant to view deal analytics.</p>
          <Link to="/explore"><Button>Browse Restaurants</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter by selected restaurant
  const claimedIds = new Set(claimedRestaurants.map((r: any) => r.id));
  const filtered = (redemptions || []).filter((r: any) => {
    if (!r.deal?.restaurant_id || !claimedIds.has(r.deal.restaurant_id)) return false;
    if (selectedRestaurant !== "all" && r.deal.restaurant_id !== selectedRestaurant) return false;
    return true;
  });

  const totalRedemptions = filtered.length;
  const totalXPSpent = filtered.reduce((sum: number, r: any) => sum + (r.xp_spent || 0), 0);
  const uniqueUsers = new Set(filtered.map((r: any) => r.user_id)).size;
  const usedCount = filtered.filter((r: any) => r.used_at).length;

  // Top deals
  const dealCounts: Record<string, { title: string; count: number; xp: number }> = {};
  filtered.forEach((r: any) => {
    const key = r.deal_id;
    if (!dealCounts[key]) dealCounts[key] = { title: r.deal?.title || "Unknown", count: 0, xp: 0 };
    dealCounts[key].count++;
    dealCounts[key].xp += r.xp_spent || 0;
  });
  const topDeals = Object.values(dealCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  // Daily chart (last 30 days)
  const dailyMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  filtered.forEach((r: any) => {
    if (r.redeemed_at) {
      const day = r.redeemed_at.slice(0, 10);
      if (dailyMap[day] !== undefined) dailyMap[day]++;
    }
  });
  const chartData = Object.entries(dailyMap).map(([date, count]) => ({
    date: date.slice(5),
    redemptions: count,
  }));

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Deal Analytics | FlavorFind" description="View redemption analytics for your restaurant deals." />
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Deal Analytics</h1>
              <p className="text-sm text-muted-foreground">Track how your deals are performing</p>
            </div>
          </div>
          {claimedRestaurants.length > 1 && (
            <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All restaurants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Restaurants</SelectItem>
                {claimedRestaurants.map((r: any) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Ticket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRedemptions}</p>
                <p className="text-xs text-muted-foreground">Redemptions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{uniqueUsers}</p>
                <p className="text-xs text-muted-foreground">Unique Customers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalXPSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP Spent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalRedemptions > 0 ? Math.round((usedCount / totalRedemptions) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">Usage Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart + Top Deals */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Redemptions (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {totalRedemptions === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No redemption data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="redemptions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {topDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No deals redeemed yet</p>
              ) : (
                <div className="space-y-3">
                  {topDeals.map((deal, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-muted-foreground w-5">{i + 1}.</span>
                        <span className="text-sm font-medium truncate">{deal.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary">{deal.count} redeemed</Badge>
                        <span className="text-xs text-muted-foreground">{deal.xp.toLocaleString()} XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent redemptions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No redemptions yet. Create deals to attract customers!</p>
            ) : (
              <div className="space-y-3">
                {filtered.slice(0, 10).map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.deal?.title || "Unknown Deal"}</p>
                      <p className="text-xs text-muted-foreground">{r.xp_spent || 0} XP spent</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={r.used_at ? "default" : "outline"} className="text-xs">
                        {r.used_at ? "Used" : "Redeemed"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {r.redeemed_at ? new Date(r.redeemed_at).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
