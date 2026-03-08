import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from "recharts";
import { TrendingUp, Star, Users, Calendar } from "lucide-react";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
];

function useReviewTrends() {
  return useQuery({
    queryKey: ["admin-review-trends"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("created_at, rating, status")
        .order("created_at", { ascending: true });

      if (!data) return [];

      const monthly: Record<string, { month: string; count: number; avgRating: number; ratings: number[] }> = {};
      data.forEach((r) => {
        const d = new Date(r.created_at!);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (!monthly[key]) monthly[key] = { month: label, count: 0, avgRating: 0, ratings: [] };
        monthly[key].count++;
        monthly[key].ratings.push(r.rating);
      });

      return Object.values(monthly)
        .map((m) => ({
          month: m.month,
          reviews: m.count,
          avgRating: +(m.ratings.reduce((a, b) => a + b, 0) / m.ratings.length).toFixed(1),
        }))
        .slice(-12);
    },
  });
}

function useRatingDistribution() {
  return useQuery({
    queryKey: ["admin-rating-distribution"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("rating")
        .eq("status", "approved");

      const dist = [0, 0, 0, 0, 0];
      data?.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++; });
      return dist.map((count, i) => ({ rating: `${i + 1}★`, count, fill: CHART_COLORS[i] }));
    },
  });
}

function useCuisineBreakdown() {
  return useQuery({
    queryKey: ["admin-cuisine-breakdown"],
    queryFn: async () => {
      const { data } = await supabase.from("restaurants").select("cuisines").eq("is_active", true);
      const counts: Record<string, number> = {};
      data?.forEach((r) => {
        (r.cuisines as string[] | null)?.forEach((c) => {
          counts[c] = (counts[c] || 0) + 1;
        });
      });
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name: name.replace("_", " "), count }));
    },
  });
}

function useUserGrowth() {
  return useQuery({
    queryKey: ["admin-user-growth"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (!data) return [];

      const monthly: Record<string, { month: string; newUsers: number; cumulative: number }> = {};
      let total = 0;
      data.forEach((p) => {
        const d = new Date(p.created_at!);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
        if (!monthly[key]) monthly[key] = { month: label, newUsers: 0, cumulative: 0 };
        monthly[key].newUsers++;
        total++;
        monthly[key].cumulative = total;
      });

      // Ensure cumulative is correct across all months
      let running = 0;
      return Object.values(monthly).map((m) => {
        running += m.newUsers;
        return { ...m, cumulative: running };
      }).slice(-12);
    },
  });
}

function useNeighborhoodStats() {
  return useQuery({
    queryKey: ["admin-neighborhood-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("neighborhood, average_rating, total_reviews")
        .eq("is_active", true)
        .not("neighborhood", "is", null);

      const stats: Record<string, { name: string; restaurants: number; avgRating: number; ratings: number[] }> = {};
      data?.forEach((r) => {
        const n = r.neighborhood || "Unknown";
        if (!stats[n]) stats[n] = { name: n, restaurants: 0, avgRating: 0, ratings: [] };
        stats[n].restaurants++;
        if (r.average_rating) stats[n].ratings.push(Number(r.average_rating));
      });

      return Object.values(stats)
        .map((s) => ({
          name: s.name,
          restaurants: s.restaurants,
          avgRating: s.ratings.length ? +(s.ratings.reduce((a, b) => a + b, 0) / s.ratings.length).toFixed(1) : 0,
        }))
        .sort((a, b) => b.restaurants - a.restaurants)
        .slice(0, 8);
    },
  });
}

export default function AnalyticsDashboard() {
  const { data: reviewTrends, isLoading: trendsLoading } = useReviewTrends();
  const { data: ratingDist, isLoading: distLoading } = useRatingDistribution();
  const { data: cuisines, isLoading: cuisineLoading } = useCuisineBreakdown();
  const { data: userGrowth, isLoading: growthLoading } = useUserGrowth();
  const { data: neighborhoods, isLoading: neighborhoodLoading } = useNeighborhoodStats();

  const isLoading = trendsLoading || distLoading || cuisineLoading || growthLoading || neighborhoodLoading;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader><div className="h-4 bg-muted rounded w-32" /></CardHeader>
            <CardContent><div className="h-48 bg-muted rounded" /></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="reviews" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto no-scrollbar gap-1 bg-transparent p-0 h-auto">
          <TabsTrigger value="reviews" className="gap-1.5 text-xs sm:text-sm shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-2">
            <TrendingUp className="w-3.5 h-3.5" /> Review Trends
          </TabsTrigger>
          <TabsTrigger value="ratings" className="gap-1.5 text-xs sm:text-sm shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-2">
            <Star className="w-3.5 h-3.5" /> Ratings
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-2">
            <Users className="w-3.5 h-3.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="areas" className="gap-1.5 text-xs sm:text-sm shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-2">
            <Calendar className="w-3.5 h-3.5" /> Areas & Cuisines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">Monthly Reviews</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={reviewTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="reviews" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">Avg Rating Over Time</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={reviewTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="avgRating" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ fill: CHART_COLORS[2], r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratings">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">Rating Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={ratingDist}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {ratingDist?.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">Rating Breakdown</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={ratingDist}
                      dataKey="count"
                      nameKey="rating"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ rating, count }) => `${rating}: ${count}`}
                      labelLine={false}
                    >
                      {ratingDist?.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">User Growth</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="cumulative" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.2} strokeWidth={2} name="Total Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">New Signups / Month</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="newUsers" fill={CHART_COLORS[3]} radius={[6, 6, 0, 0]} name="New Users" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="areas">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">Top Cuisines</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cuisines} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} name="Restaurants" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm sm:text-base">Neighborhoods</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={neighborhoods}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="restaurants" fill={CHART_COLORS[1]} radius={[6, 6, 0, 0]} name="Restaurants" />
                    <Bar dataKey="avgRating" fill={CHART_COLORS[2]} radius={[6, 6, 0, 0]} name="Avg Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
