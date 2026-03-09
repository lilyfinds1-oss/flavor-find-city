import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ChevronRight, MapPin, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

const CUISINE_OPTIONS = [
  { value: "desi", label: "🍛 Desi", },
  { value: "bbq", label: "🔥 BBQ" },
  { value: "chinese", label: "🥡 Chinese" },
  { value: "italian", label: "🍕 Italian" },
  { value: "burger", label: "🍔 Burgers" },
  { value: "cafe", label: "☕ Café" },
  { value: "fast_food", label: "🍟 Fast Food" },
  { value: "seafood", label: "🐟 Seafood" },
  { value: "middle_eastern", label: "🧆 Middle Eastern" },
  { value: "japanese", label: "🍣 Japanese" },
  { value: "thai", label: "🍜 Thai" },
  { value: "fine_dining", label: "🥂 Fine Dining" },
];

const NEIGHBORHOOD_OPTIONS = [
  "Gulberg", "DHA", "Johar Town", "Model Town", "Liberty",
  "Mall Road", "Bahria Town", "MM Alam Road", "Garden Town",
  "Shadman", "Cantt", "Walled City",
];

interface OnboardingWizardProps {
  userId: string;
  open: boolean;
  onComplete: () => void;
}

export function OnboardingWizard({ userId, open, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleCuisine = (value: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : prev.length < 5 ? [...prev, value] : prev
    );
  };

  const toggleNeighborhood = (value: string) => {
    setSelectedNeighborhoods((prev) =>
      prev.includes(value) ? prev.filter((n) => n !== value) : prev.length < 3 ? [...prev, value] : prev
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        favorite_cuisines: selectedCuisines,
        preferred_neighborhoods: selectedNeighborhoods,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      toast.error("Failed to save preferences");
    } else {
      toast.success("Preferences saved! We'll personalize your experience.");
    }
    setSaving(false);
    onComplete();
  };

  const handleSkip = async () => {
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
      .eq("id", userId);
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg gap-0 [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-6">
          {[0, 1].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {step === 0 && (
          <>
            <DialogHeader className="text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <UtensilsCrossed className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="font-display text-xl">What do you love to eat?</DialogTitle>
              <DialogDescription>
                Pick up to 5 cuisines so we can personalize your recommendations.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2 mt-4">
              {CUISINE_OPTIONS.map((cuisine) => (
                <button
                  key={cuisine.value}
                  onClick={() => toggleCuisine(cuisine.value)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium border transition-all",
                    selectedCuisines.includes(cuisine.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  {cuisine.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <button onClick={handleSkip} className="text-sm text-muted-foreground hover:text-foreground">
                Skip for now
              </button>
              <Button onClick={() => setStep(1)} className="gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <DialogHeader className="text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="font-display text-xl">Your favorite areas?</DialogTitle>
              <DialogDescription>
                Pick up to 3 neighborhoods you frequent in Lahore.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-2 mt-4">
              {NEIGHBORHOOD_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => toggleNeighborhood(n)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium border transition-all",
                    selectedNeighborhoods.includes(n)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={handleFinish} disabled={saving} className="gap-2">
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {saving ? "Saving..." : "Get Started!"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
