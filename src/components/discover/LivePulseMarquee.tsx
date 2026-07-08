import { Link } from "react-router-dom";
import { Flame, Star, MessageSquare, Trophy, Sparkles, Gift } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";
import { useTopRatedRestaurants } from "@/hooks/useTopRatedRestaurants";
import { useTrendingRestaurants } from "@/hooks/useTrendingRestaurants";
import { useFeaturedDeals } from "@/hooks/useFeaturedDeals";
import { useCity } from "@/contexts/CityContext";

type Pill = {
  icon: typeof Flame;
  label: string;
  to: string;
  tone: string;
};

export function LivePulseMarquee() {
  const { city } = useCity();
  const { data: top } = useTopRatedRestaurants(4);
  const { data: trending } = useTrendingRestaurants(4);
  const { data: deals } = useFeaturedDeals(3);

  const pills: Pill[] = [];

  trending?.forEach((r) =>
    pills.push({
      icon: Flame,
      label: `${r.name} is trending`,
      to: `/restaurant/${r.slug}`,
      tone: "text-trending",
    }),
  );
  top?.forEach((r) =>
    pills.push({
      icon: Star,
      label: `${r.name} · ${r.average_rating?.toFixed(1) ?? "New"}★`,
      to: `/restaurant/${r.slug}`,
      tone: "text-accent",
    }),
  );
  deals?.forEach((d) =>
    pills.push({
      icon: Gift,
      label: d.restaurant?.name ? `${d.title} @ ${d.restaurant.name}` : d.title,
      to: "/deals",
      tone: "text-primary",
    }),
  );
  pills.push(
    { icon: MessageSquare, label: "New threads in Community", to: "/community", tone: "text-ai-pulse" },
    { icon: Trophy, label: "Leaderboard just updated", to: "/leaderboard", tone: "text-accent" },
    { icon: Sparkles, label: `Ask the AI what to eat in ${city?.name || "your city"}`, to: "/assistant", tone: "text-ai-pulse" },
  );

  if (pills.length < 3) return null;

  return (
    <div className="border-y border-border/60 bg-muted/20 py-3">
      <Marquee durationSec={55} className="[--gap:1rem]">
        {pills.map((p, i) => {
          const Icon = p.icon;
          return (
            <Link
              key={i}
              to={p.to}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs sm:text-sm text-foreground/90 transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Icon className={`h-3.5 w-3.5 ${p.tone}`} />
              {p.label}
            </Link>
          );
        })}
      </Marquee>
    </div>
  );
}
