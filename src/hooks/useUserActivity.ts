import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ActivityType = "viewed_restaurant" | "liked_restaurant" | "search_query" | "review_written" | "dish_scanned";

export function useTrackActivity() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ activityType, entityId, metadata }: { activityType: ActivityType; entityId?: string; metadata?: any }) => {
      if (!user) return;
      await supabase.from("user_activity").insert({
        user_id: user.id,
        activity_type: activityType,
        entity_id: entityId || null,
        metadata: metadata || {},
      });
    },
  });
}
