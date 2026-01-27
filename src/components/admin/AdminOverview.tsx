import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAdminData";
import { 
  Store, 
  MessageSquare, 
  Users, 
  Zap, 
  Tag, 
  TrendingUp,
  Star,
  Clock
} from "lucide-react";

export default function AdminOverview() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Restaurants",
      value: analytics?.totalRestaurants || 0,
      subtitle: `${analytics?.activeRestaurants || 0} active`,
      icon: Store,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Reviews",
      value: analytics?.totalReviews || 0,
      subtitle: `${analytics?.pendingReviews || 0} pending`,
      icon: MessageSquare,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Registered Users",
      value: analytics?.totalUsers || 0,
      subtitle: "Community members",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total XP Earned",
      value: analytics?.totalXP?.toLocaleString() || 0,
      subtitle: "Points distributed",
      icon: Zap,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Active Deals",
      value: analytics?.activeDeals || 0,
      subtitle: "Live promotions",
      icon: Tag,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: "Deal Redemptions",
      value: analytics?.totalRedemptions || 0,
      subtitle: "Total claimed",
      icon: TrendingUp,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Average Rating",
      value: analytics?.avgRating?.toFixed(1) || "0.0",
      subtitle: "Across all reviews",
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Pending Reviews",
      value: analytics?.pendingReviews || 0,
      subtitle: "Awaiting moderation",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Store className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">Add New Restaurant</span>
              </div>
              <span className="text-sm text-muted-foreground">Go to Restaurants tab</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                </div>
                <span className="font-medium">Moderate Reviews</span>
              </div>
              <span className="text-sm text-muted-foreground">{analytics?.pendingReviews || 0} pending</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Restaurant Activation Rate</span>
                <span className="font-medium">
                  {analytics?.totalRestaurants 
                    ? Math.round((analytics.activeRestaurants / analytics.totalRestaurants) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ 
                    width: `${analytics?.totalRestaurants 
                      ? (analytics.activeRestaurants / analytics.totalRestaurants) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Review Approval Rate</span>
                <span className="font-medium">
                  {analytics?.totalReviews 
                    ? Math.round(((analytics.totalReviews - analytics.pendingReviews) / analytics.totalReviews) * 100) 
                    : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ 
                    width: `${analytics?.totalReviews 
                      ? ((analytics.totalReviews - analytics.pendingReviews) / analytics.totalReviews) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
