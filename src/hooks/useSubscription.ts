import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Subscription {
  id: string;
  restaurant_id: string;
  user_id: string;
  plan_name: string;
  status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

export function useSubscription(restaurantId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscription", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await supabase
        .from("restaurant_subscriptions")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data as Subscription | null;
    },
    enabled: !!user && !!restaurantId,
  });
}

export function useMySubscriptions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-subscriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_subscriptions")
        .select("*, restaurants(name, slug, cover_image, cuisines)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });
}

export function useMyClaimedRestaurants() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-claimed-restaurants", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_claims")
        .select("restaurant_id, restaurants(id, name, slug, cover_image, cuisines)")
        .eq("user_id", user!.id)
        .eq("status", "approved");
      if (error) throw error;
      return data?.map((c: any) => c.restaurants).filter(Boolean) || [];
    },
    enabled: !!user,
  });
}
