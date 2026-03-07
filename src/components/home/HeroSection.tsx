import { useState } from "react";
import { Search, MapPin, Sparkles, TrendingUp, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const trendingSearches = [
  "Best Steakhouses",
  "Desi Food",
  "Halal",
  "Cafes",
  "Late Night",
];

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-slide-in-bottom">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">500+ restaurants ranked in Lahore</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 slide-up">
            Discover the{" "}
            <span className="gradient-text">best eats</span>
            <br />in your city
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto slide-up" style={{ animationDelay: "100ms" }}>
            AI-powered rankings, real reviews, exclusive deals. Find your next favorite restaurant and earn rewards while you eat.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6 slide-up" style={{ animationDelay: "200ms" }}>
            <div className="flex gap-2 p-2 bg-card rounded-2xl shadow-lg border border-border/50">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search restaurants, cuisines, or dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 bg-transparent text-base placeholder:text-muted-foreground/70"
                />
              </div>
              <Button variant="glass" size="lg" className="hidden sm:flex gap-2">
                <MapPin className="w-4 h-4" />
                Lahore
              </Button>
              <Button variant="hero" size="lg">
                Search
              </Button>
            </div>
          </div>

          {/* Trending searches */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 slide-up" style={{ animationDelay: "300ms" }}>
            <span className="text-sm text-muted-foreground">Trending:</span>
            {trendingSearches.map((search) => (
              <Link
                key={search}
                to={`/explore?q=${encodeURIComponent(search)}`}
                className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center slide-up" style={{ animationDelay: "400ms" }}>
            <Link to="/assistant">
              <Button variant="hero" size="xl" className="gap-2 w-full sm:w-auto">
                <Sparkles className="w-5 h-5" />
                What should I eat today?
              </Button>
            </Link>
            <Link to="/top-100">
              <Button variant="outline" size="xl" className="gap-2 w-full sm:w-auto">
                <Star className="w-5 h-5" />
                View Top 100
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16 slide-up" style={{ animationDelay: "500ms" }}>
          {[
            { value: "500+", label: "Restaurants" },
            { value: "10K+", label: "Reviews" },
            { value: "50+", label: "Deals" },
            { value: "5K+", label: "Foodies" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
