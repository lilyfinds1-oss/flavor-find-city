import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ALL_CUISINES = [
  "Pakistani", "Desi", "Chinese", "Continental", "Italian", "BBQ",
  "Fast Food", "Seafood", "Thai", "Japanese", "Korean", "Mexican",
  "Mediterranean", "Halal", "Vegetarian", "Cafe", "Bakery", "Street Food",
];

export function DietaryPreferences() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("favorite_cuisines").eq("id", user.id).single().then(({ data }) => {
      if (data?.favorite_cuisines) setSelected(data.favorite_cuisines);
    });
  }, [user]);

  const toggle = (c: string) => {
    setSelected((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ favorite_cuisines: selected, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (error) toast.error("Failed to save preferences");
    else toast.success("Preferences updated!");
    setSaving(false);
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-primary" />
          Cuisine Preferences
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Select your favorite cuisines for personalized recommendations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {ALL_CUISINES.map((c) => (
            <Badge
              key={c}
              variant={selected.includes(c) ? "default" : "outline"}
              className="cursor-pointer text-xs px-3 py-1.5 transition-colors hover:bg-primary/20"
              onClick={() => toggle(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}
