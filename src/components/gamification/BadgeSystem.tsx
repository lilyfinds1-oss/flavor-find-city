import { Award, Flame, Star, MessageSquare, Camera, Users, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GamificationBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  requirement: number;
  type: "reviews" | "votes" | "photos" | "xp" | "referrals";
}

export const BADGES: GamificationBadge[] = [
  {
    id: "first-review",
    name: "First Bite",
    description: "Write your first review",
    icon: MessageSquare,
    color: "text-primary",
    bgColor: "bg-primary/10",
    requirement: 1,
    type: "reviews",
  },
  {
    id: "food-critic",
    name: "Food Critic",
    description: "Write 10 reviews",
    icon: Star,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    requirement: 10,
    type: "reviews",
  },
  {
    id: "taste-master",
    name: "Taste Master",
    description: "Write 50 reviews",
    icon: Crown,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    requirement: 50,
    type: "reviews",
  },
  {
    id: "community-voice",
    name: "Community Voice",
    description: "Cast 25 votes",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    requirement: 25,
    type: "votes",
  },
  {
    id: "shutterbug",
    name: "Shutterbug",
    description: "Upload 10 photos",
    icon: Camera,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    requirement: 10,
    type: "photos",
  },
  {
    id: "xp-collector",
    name: "XP Collector",
    description: "Earn 500 XP",
    icon: Zap,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    requirement: 500,
    type: "xp",
  },
  {
    id: "xp-legend",
    name: "XP Legend",
    description: "Earn 5000 XP",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    requirement: 5000,
    type: "xp",
  },
  {
    id: "ambassador",
    name: "Ambassador",
    description: "Refer 5 friends",
    icon: Award,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    requirement: 5,
    type: "referrals",
  },
];

export function getEarnedBadges(stats: {
  reviews: number;
  votes: number;
  photos: number;
  xp: number;
  referrals: number;
}) {
  return BADGES.filter((badge) => {
    switch (badge.type) {
      case "reviews": return stats.reviews >= badge.requirement;
      case "votes": return stats.votes >= badge.requirement;
      case "photos": return stats.photos >= badge.requirement;
      case "xp": return stats.xp >= badge.requirement;
      case "referrals": return stats.referrals >= badge.requirement;
      default: return false;
    }
  });
}

export function getProgress(badge: GamificationBadge, stats: {
  reviews: number;
  votes: number;
  photos: number;
  xp: number;
  referrals: number;
}) {
  let current = 0;
  switch (badge.type) {
    case "reviews": current = stats.reviews; break;
    case "votes": current = stats.votes; break;
    case "photos": current = stats.photos; break;
    case "xp": current = stats.xp; break;
    case "referrals": current = stats.referrals; break;
  }
  return Math.min(current / badge.requirement, 1);
}

interface BadgeDisplayProps {
  badge: GamificationBadge;
  earned: boolean;
  progress?: number;
  size?: "sm" | "md";
}

export function BadgeDisplay({ badge, earned, progress = 0, size = "md" }: BadgeDisplayProps) {
  const Icon = badge.icon;
  const isSm = size === "sm";

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center transition-all",
        earned ? "opacity-100" : "opacity-40 grayscale"
      )}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center relative",
          badge.bgColor,
          isSm ? "w-10 h-10" : "w-14 h-14 sm:w-16 sm:h-16"
        )}
      >
        <Icon className={cn(badge.color, isSm ? "w-5 h-5" : "w-6 h-6 sm:w-7 sm:h-7")} />
        {!earned && progress > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress * 100} 100`}
              className="text-primary/30"
            />
          </svg>
        )}
      </div>
      <span className={cn("font-medium mt-1.5", isSm ? "text-[10px]" : "text-xs sm:text-sm")}>
        {badge.name}
      </span>
      {!isSm && (
        <span className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
          {badge.description}
        </span>
      )}
    </div>
  );
}
