import { Link } from "react-router-dom";
import { Sparkles, MapPin, Trophy, Gift, MessageSquare, ArrowUpRight, Flame } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { useScrollReveal } from "@/hooks/useGsapMotion";
import { useCity } from "@/contexts/CityContext";

export function BentoHighlights() {
  const containerRef = useScrollReveal<HTMLDivElement>({ y: 32, stagger: 0.06 });
  const { city } = useCity();

  return (
    <section className="py-10 sm:py-16 px-4">
      <div ref={containerRef} className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div data-reveal>
            <span className="chip-ai mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Explore {city?.name || "your city"}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
              Everything worth tasting,
              <span className="gradient-text-ai"> in one canvas</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm" data-reveal>
            Jump into curated corners of the platform — from AI picks to community heat.
          </p>
        </div>

        <BentoGrid>
          <BentoCard
            colSpan={2}
            rowSpan={2}
            gradient="linear-gradient(135deg, hsl(var(--ai-pulse) / 0.25), hsl(var(--primary) / 0.15))"
            className="[&>div]:p-6"
          >
            <Link to="/assistant" data-reveal className="flex h-full flex-col justify-between">
              <div className="flex items-center gap-2 text-ai-pulse">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">AI Assistant</span>
              </div>
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                  Ask us what to eat tonight
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Budget, mood, cuisine, dietary needs — we'll match you to the right table.
                </p>
                <div className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                  Chat with the assistant
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          </BentoCard>

          <BentoCard
            colSpan={2}
            gradient="linear-gradient(135deg, hsl(var(--trending) / 0.2), transparent)"
            className="[&>div]:p-5"
          >
            <Link to="/map" data-reveal className="flex h-full flex-col justify-between">
              <div className="flex items-center gap-2 text-trending">
                <MapPin className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Map</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold mb-1">Live restaurant map</h3>
                <p className="text-muted-foreground text-xs">
                  Heat layers, clustering, and swipeable cards across {city?.name || "the city"}.
                </p>
              </div>
            </Link>
          </BentoCard>

          <BentoCard
            gradient="linear-gradient(135deg, hsl(var(--accent) / 0.25), transparent)"
            className="[&>div]:p-5"
          >
            <Link to="/leaderboard" data-reveal className="flex h-full flex-col justify-between">
              <Trophy className="w-6 h-6 text-accent" />
              <div>
                <h3 className="font-display text-lg font-bold">Leaderboard</h3>
                <p className="text-muted-foreground text-xs">Top reviewers of the week</p>
              </div>
            </Link>
          </BentoCard>

          <BentoCard
            gradient="linear-gradient(135deg, hsl(16 85% 58% / 0.25), transparent)"
            className="[&>div]:p-5"
          >
            <Link to="/deals" data-reveal className="flex h-full flex-col justify-between">
              <Gift className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-display text-lg font-bold">XP Deals</h3>
                <p className="text-muted-foreground text-xs">Redeem points for BOGO & discounts</p>
              </div>
            </Link>
          </BentoCard>

          <BentoCard
            colSpan={2}
            gradient="linear-gradient(135deg, hsl(280 80% 65% / 0.2), transparent)"
            className="[&>div]:p-5"
          >
            <Link to="/community" data-reveal className="flex h-full flex-col justify-between">
              <div className="flex items-center gap-2 text-ai-pulse">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Community</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold mb-1">Join the conversation</h3>
                <p className="text-muted-foreground text-xs">
                  Reddit-style threads on hidden gems, food fails, and openings.
                </p>
              </div>
            </Link>
          </BentoCard>

          <BentoCard
            gradient="linear-gradient(135deg, hsl(340 85% 60% / 0.25), transparent)"
            className="[&>div]:p-5"
          >
            <Link to="/top-100" data-reveal className="flex h-full flex-col justify-between">
              <Flame className="w-6 h-6 text-trending" />
              <div>
                <h3 className="font-display text-lg font-bold">Top 100</h3>
                <p className="text-muted-foreground text-xs">The definitive city ranking</p>
              </div>
            </Link>
          </BentoCard>
        </BentoGrid>
      </div>
    </section>
  );
}
