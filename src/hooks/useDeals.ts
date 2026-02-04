import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Deal {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  deal_type: "percentage" | "fixed" | "bogo" | "free_item";
  discount_value: number | null;
  xp_cost: number | null;
  expires_at: string | null;
  terms: string | null;
  is_active: boolean | null;
  restaurant?: {
    name: string;
    slug: string;
    cover_image: string | null;
  };
}

export function useDeals() {
  return useQuery({
    queryKey: ["deals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select(`
          *,
          restaurant:restaurants!deals_restaurant_id_fkey (
            name,
            slug,
            cover_image
          )
        `)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("xp_cost", { ascending: true });

      if (error) {
        // Fallback without join
        const { data: simpleData, error: simpleError } = await supabase
          .from("deals")
          .select("*")
          .eq("is_active", true)
          .gt("expires_at", new Date().toISOString())
          .order("xp_cost", { ascending: true });

        if (simpleError) throw simpleError;
        return simpleData as Deal[];
      }

      return data as Deal[];
    },
  });
}

export function useUserXP() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-xp", user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { data, error } = await supabase
        .from("profiles")
        .select("xp_points")
        .eq("id", user.id)
        .single();

      if (error) return 0;
      return data?.xp_points || 0;
    },
    enabled: !!user,
  });
}

export function useRedeemDeal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, xpCost }: { dealId: string; xpCost: number }) => {
      if (!user) throw new Error("Not authenticated");

      // Check user XP
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp_points")
        .eq("id", user.id)
        .single();

      if (!profile || (profile.xp_points || 0) < xpCost) {
        throw new Error("Not enough XP");
      }

      // Insert redemption
      const { error: redemptionError } = await supabase
        .from("deal_redemptions")
        .insert({
          deal_id: dealId,
          user_id: user.id,
          xp_spent: xpCost,
        });

      if (redemptionError) throw redemptionError;

      // Deduct XP
      const { error: xpError } = await supabase
        .from("profiles")
        .update({ xp_points: (profile.xp_points || 0) - xpCost })
        .eq("id", user.id);

      if (xpError) throw xpError;

      // Log transaction
      await supabase.from("xp_transactions").insert({
        user_id: user.id,
        action: "deal_redemption",
        amount: -xpCost,
        reference_type: "deal",
        reference_id: dealId,
      });

      return true;
    },
    onSuccess: () => {
      toast.success("Deal redeemed successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-xp"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to redeem deal");
    },
  });
}
