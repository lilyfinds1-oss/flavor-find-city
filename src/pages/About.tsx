import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { SEOHead } from "@/components/seo/SEOHead";
import { Zap, Users, MapPin, Star } from "lucide-react";

const stats = [
  { label: "Restaurants Listed", value: "500+", icon: MapPin },
  { label: "Active Foodies", value: "10K+", icon: Users },
  { label: "Reviews Written", value: "25K+", icon: Star },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="About CityBites" description="CityBites is Pakistan's AI-powered food discovery platform helping you find your next favorite meal." />
      <Header />
      <PageTransition>
        <main className="flex-1">
          <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 sm:py-28">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-ai flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                About <span className="gradient-text">CityBites</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're building Pakistan's most intelligent food discovery platform — powered by AI, driven by community.
              </p>
            </div>
          </section>

          <section className="max-w-4xl mx-auto px-4 py-16 space-y-12">
            <div>
              <h2 className="font-display text-2xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                CityBites was born from a simple frustration: finding great food shouldn't be hard. We combine AI-powered recommendations, real community reviews, and curated lists to help you discover restaurants you'll love — whether you're looking for the best biryani in town, a hidden gem for date night, or a late-night craving fix.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-4 text-foreground">What Makes Us Different</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> AI-powered search that understands natural language queries</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Community-driven rankings — real foodies, real votes</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Dish-level recognition and recommendations</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Gamified experience with XP, badges, and leaderboards</li>
                <li className="flex gap-3"><span className="text-primary font-bold">•</span> Exclusive deals and rewards for active community members</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((s) => (
                <div key={s.label} className="bg-card border border-border/50 rounded-2xl p-6 text-center">
                  <s.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-display text-3xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
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
