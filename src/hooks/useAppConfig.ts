import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppConfigKey = "mapbox_public_token";

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
      const { data, error } = await supabase
        .from("app_config")
        .update({ value })
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["app-config", variables.key] });
    },
  });
}
