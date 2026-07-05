import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Users, Ticket, BarChart3, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DATE_RANGE_OPTIONS, buildDailySeries, downloadCSV, withinRange, type DateRange } from "@/lib/analytics-utils";

interface RedemptionWithDetails {
  id: string;
  deal_id: string;
  user_id: string;
  xp_spent: number | null;
  redeemed_at: string | null;
  used_at: string | null;
  deal: { title: string; deal_type: string; restaurant_id: string } | null;
  profile: { username: string | null; display_name: string | null } | null;
}

export default function DealRedemptionAnalytics() {
  const [range, setRange] = useState<DateRange>("30d");

  const { data: redemptions, isLoading } = useQuery({
    queryKey: ["admin-deal-redemptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deal_redemptions")
        .select(`
          *,
          deal:deals!deal_redemptions_deal_id_fkey (title, deal_type, restaurant_id),
          profile:profiles!deal_redemptions_user_id_fkey (username, display_name)
        `)
        .order("redeemed_at", { ascending: false });

      if (error) {
        const { data: fallback, error: fallbackError } = await supabase
          .from("deal_redemptions")
          .select("*")
          .order("redeemed_at", { ascending: false });
        if (fallbackError) throw fallbackError;
        return (fallback || []).map((r) => ({ ...r, deal: null, profile: null })) as RedemptionWithDetails[];
      }
      return data as unknown as RedemptionWithDetails[];
    },
  });

  const filtered = useMemo(
    () => (redemptions || []).filter((r) => withinRange(r.redeemed_at, range)),
    [redemptions, range],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalRedemptions = filtered.length;
  const totalXPSpent = filtered.reduce((sum, r) => sum + (r.xp_spent || 0), 0);
  const uniqueUsers = new Set(filtered.map((r) => r.user_id)).size;
  const usedCount = filtered.filter((r) => r.used_at).length;

  const dealCounts: Record<string, { title: string; count: number; xp: number }> = {};
  filtered.forEach((r) => {
    const key = r.deal_id;
    if (!dealCounts[key]) {
      dealCounts[key] = { title: r.deal?.title || "Unknown Deal", count: 0, xp: 0 };
    }
    dealCounts[key].count++;
    dealCounts[key].xp += r.xp_spent || 0;
  });
  const topDeals = Object.values(dealCounts).sort((a, b) => b.count - a.count).slice(0, 5);

  const chartData = buildDailySeries(filtered, range);
  const recentActivity = filtered.slice(0, 8);

  const handleExport = () => {
    downloadCSV(
      `redemptions-${range}-${new Date().toISOString().slice(0, 10)}.csv`,
      filtered.map((r) => ({
        redeemed_at: r.redeemed_at,
        used_at: r.used_at,
        deal: r.deal?.title || "",
        deal_type: r.deal?.deal_type || "",
        user: r.profile?.display_name || r.profile?.username || "",
        user_id: r.user_id,
        xp_spent: r.xp_spent ?? 0,
      })),
    );
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DATE_RANGE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRedemptions}</p>
              <p className="text-xs text-muted-foreground">Total Redemptions</p>
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
              <p className="text-xs text-muted-foreground">Unique Users</p>
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
              <p className="text-xs text-muted-foreground">Total XP Spent</p>
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
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Redemptions ({DATE_RANGE_OPTIONS.find((o) => o.value === range)?.label})</CardTitle>
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
            <CardTitle className="text-base">Top Deals by Redemptions</CardTitle>
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

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Redemptions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No redemptions yet</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm border-b border-border pb-2 last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{r.profile?.display_name || r.profile?.username || "Unknown User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.deal?.title || "Unknown Deal"}</p>
                    </div>
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
    </div>
  );
}
