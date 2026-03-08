import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppConfigKey = "mapbox_public_token" | "openai_api_key" | "gemini_api_key";

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
      // Upsert: try update, if no rows affected, insert
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
