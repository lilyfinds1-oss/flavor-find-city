import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TrendingTopic {
  title: string;
  description: string;
  emoji: string;
  heat: "hot" | "warm" | "rising";
  post_count: number;
}

function useTrendingTopics() {
  return useQuery({
    queryKey: ["community-trending-topics"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-trending-topics");
      if (error) throw error;
      return (data?.topics || []) as TrendingTopic[];
    },
    staleTime: 10 * 60 * 1000, // 10 min cache
    retry: 1,
  });
}

const heatConfig = {
  hot: { icon: Flame, label: "Hot", className: "bg-destructive/10 text-destructive border-destructive/20" },
  warm: { icon: TrendingUp, label: "Warm", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  rising: { icon: Sparkles, label: "Rising", className: "bg-primary/10 text-primary border-primary/20" },
};

export function TrendingTopics() {
  const { data: topics, isLoading } = useTrendingTopics();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Detecting trending topics...</span>
      </div>
    );
  }

  if (!topics?.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-primary" />
        AI-Detected Trending Topics
      </h3>
      <div className="grid gap-2">
        {topics.map((topic, i) => {
          const heat = heatConfig[topic.heat] || heatConfig.rising;
          const HeatIcon = heat.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors"
            >
              <span className="text-xl leading-none mt-0.5">{topic.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{topic.title}</h4>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 gap-0.5 ${heat.className}`}>
                    <HeatIcon className="w-2.5 h-2.5" />
                    {heat.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{topic.description}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                ~{topic.post_count} posts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
