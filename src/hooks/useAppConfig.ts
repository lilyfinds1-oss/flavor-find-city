import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Only non-secret keys are readable/writable from the browser.
// Stripe secret and Gemini API keys are stored as server-side Edge Function
// secrets (Deno.env) and MUST NEVER be fetched from the client.
export type AppConfigKey = "mapbox_public_token" | "stripe_publishable_key";

export function useAppConfig(key: AppConfigKey) {
  return useQuery({
    queryKey: ["app-config", key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", key)
        .maybeSingle();

      if (error) throw error;
      return data?.value || "";
    },
  });
}

export function useUpdateAppConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: AppConfigKey; value: string }) => {
      const { data: existing } = await supabase
        .from("app_config")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("app_config")
          .update({ value })
          .eq("key", key)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("app_config")
          .insert({ key, value })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["app-config", variables.key] });
    },
  });
}
