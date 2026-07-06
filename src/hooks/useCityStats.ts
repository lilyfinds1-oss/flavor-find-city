import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCity } from "@/contexts/CityContext";

export function useCityStats() {
  const { city } = useCity();
  return useQuery({
    queryKey: ["city-stats", city?.name],
    queryFn: async () => {
      if (!city?.name) return { total: 0, neighborhoods: [] as { name: string; count: number }[] };

      const { data, error } = await supabase
        .from("restaurants")
        .select("neighborhood")
        .eq("is_active", true)
        .eq("city", city.name);

      if (error) throw error;

      const counts = new Map<string, number>();
      for (const row of data ?? []) {
        const n = (row as { neighborhood: string | null }).neighborhood;
        if (!n) continue;
        counts.set(n, (counts.get(n) ?? 0) + 1);
      }

      const neighborhoods = [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      return { total: data?.length ?? 0, neighborhoods };
    },
    enabled: !!city?.name,
    staleTime: 5 * 60 * 1000,
  });
}
