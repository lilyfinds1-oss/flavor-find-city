import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart3, Users, Megaphone, Star, Shield, Zap } from "lucide-react";

const benefits = [
  { icon: Users, title: "Reach More Customers", description: "Get discovered by thousands of food lovers actively searching for their next meal." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Track views, saves, reviews, and engagement with detailed analytics." },
  { icon: Megaphone, title: "Promoted Listings", description: "Boost your visibility with promoted placements in search results and curated lists." },
  { icon: Star, title: "Manage Reviews", description: "Respond to customer reviews and build your restaurant's reputation." },
  { icon: Shield, title: "Verified Badge", description: "Get a verified badge to build trust and stand out from the competition." },
  { icon: Zap, title: "AI Marketing Tools", description: "Generate menu descriptions, social media posts, and marketing copy with AI." },
];

export default function ForRestaurants() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="For Restaurants — CityBites" description="Grow your restaurant with CityBites. Get discovered, manage reviews, and boost sales." />
      <Header />
      <PageTransition>
        <main className="flex-1">
          <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 sm:py-28">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Grow Your Restaurant with <span className="gradient-text">CityBites</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of restaurants reaching new customers every day through Pakistan's fastest-growing food discovery platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/restaurant-subscribe">
                  <Button variant="hero" size="lg">Get Started Free</Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg">View Pricing</Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="max-w-5xl mx-auto px-4 py-16">
            <h2 className="font-display text-2xl font-bold text-center mb-10 text-foreground">Why Restaurants Choose CityBites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="bg-card border border-border/50 rounded-2xl p-6">
                  <b.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </PageTransition>
      <Footer />
    </div>
  );
}
