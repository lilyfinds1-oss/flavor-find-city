import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface TrendingBannerProps {
  count: number;
}

export function TrendingBanner({ count }: TrendingBannerProps) {
  if (count === 0) return null;

  return (
    <Badge className="bg-gradient-primary text-primary-foreground px-4 py-2 text-sm shadow-lg animate-pulse">
      <Flame className="w-4 h-4 mr-1.5 inline" />
      {count} Trending Near You
    </Badge>
  );
}
