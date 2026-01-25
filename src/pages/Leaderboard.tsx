import { Link } from "react-router-dom";
import { Trophy, Star, Medal, Crown, TrendingUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const topUsers = [
  { rank: 1, name: "FoodieQueen", avatar: "👑", xp: 12500, reviews: 87, badge: "Legend" },
  { rank: 2, name: "TasteExplorer", avatar: "🍕", xp: 10200, reviews: 72, badge: "Expert" },
  { rank: 3, name: "SpiceMaster", avatar: "🌶️", xp: 8900, reviews: 65, badge: "Expert" },
  { rank: 4, name: "BrunchLover", avatar: "🥞", xp: 7500, reviews: 58, badge: "Pro" },
  { rank: 5, name: "SushiSensei", avatar: "🍣", xp: 6800, reviews: 52, badge: "Pro" },
  { rank: 6, name: "BBQKing", avatar: "🍖", xp: 6200, reviews: 48, badge: "Pro" },
  { rank: 7, name: "CafeHopper", avatar: "☕", xp: 5500, reviews: 43, badge: "Rising" },
  { rank: 8, name: "StreetFoodFan", avatar: "🌮", xp: 4800, reviews: 38, badge: "Rising" },
  { rank: 9, name: "DessertDiva", avatar: "🍰", xp: 4200, reviews: 34, badge: "Rising" },
  { rank: 10, name: "VeganVoyager", avatar: "🥗", xp: 3900, reviews: 31, badge: "Active" },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-6 h-6 text-amber" />;
  if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
  if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
  return <span className="font-display font-bold text-lg">{rank}</span>;
};

const getBadgeColor = (badge: string) => {
  switch (badge) {
    case "Legend": return "bg-gradient-gold text-charcoal";
    case "Expert": return "bg-primary text-primary-foreground";
    case "Pro": return "bg-success text-success-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
};

export default function Leaderboard() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-hero border-b border-border">
          <div className="container py-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Top Foodies</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most active and helpful food reviewers in Toronto. Earn XP to climb the ranks!
            </p>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="container py-8">
          <div className="flex justify-center items-end gap-4 mb-12">
            {/* 2nd Place */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
                {topUsers[1].avatar}
              </div>
              <p className="font-display font-semibold">{topUsers[1].name}</p>
              <p className="text-sm text-muted-foreground">{topUsers[1].xp.toLocaleString()} XP</p>
              <div className="mt-2 h-24 w-24 bg-gray-300 rounded-t-lg flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-gray-600">2</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="text-center">
              <Crown className="w-8 h-8 text-amber mx-auto mb-2 animate-float" />
              <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center text-5xl mx-auto mb-3 shadow-xl xp-glow">
                {topUsers[0].avatar}
              </div>
              <p className="font-display font-bold text-lg">{topUsers[0].name}</p>
              <p className="text-amber font-semibold">{topUsers[0].xp.toLocaleString()} XP</p>
              <div className="mt-2 h-32 w-28 bg-gradient-gold rounded-t-lg flex items-center justify-center">
                <span className="font-display text-4xl font-bold text-charcoal">1</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-b from-orange-300 to-orange-500 flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg">
                {topUsers[2].avatar}
              </div>
              <p className="font-display font-semibold">{topUsers[2].name}</p>
              <p className="text-sm text-muted-foreground">{topUsers[2].xp.toLocaleString()} XP</p>
              <div className="mt-2 h-20 w-24 bg-orange-400 rounded-t-lg flex items-center justify-center">
                <span className="font-display text-3xl font-bold text-white">3</span>
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Full Rankings
            </h2>
            <div className="space-y-2">
              {topUsers.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    user.rank <= 3 
                      ? "bg-card border-primary/30 shadow-sm" 
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="text-3xl">{user.avatar}</div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-display font-semibold">{user.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3 h-3" />
                      <span>{user.reviews} reviews</span>
                    </div>
                  </div>

                  {/* Badge */}
                  <Badge className={getBadgeColor(user.badge)}>{user.badge}</Badge>

                  {/* XP */}
                  <div className="text-right">
                    <p className="font-display font-bold text-amber">{user.xp.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Ready to join the leaderboard?</p>
            <Link to="/auth">
              <Button variant="hero" size="lg">Start Earning XP</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
