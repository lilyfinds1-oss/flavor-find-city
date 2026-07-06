import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClaimRestaurantProps {
  restaurantId: string;
  restaurantName: string;
}

type ClaimStatus = "pending" | "approved" | "rejected";

export function ClaimRestaurant({ restaurantId, restaurantName }: ClaimRestaurantProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [proof, setProof] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existing, setExisting] = useState<{ status: ClaimStatus; created_at: string } | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingExisting(false);
      return;
    }
    let active = true;
    supabase
      .from("restaurant_claims")
      .select("status, created_at")
      .eq("restaurant_id", restaurantId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) setExisting({ status: data.status as ClaimStatus, created_at: data.created_at });
        setLoadingExisting(false);
      });
    return () => { active = false; };
  }, [user, restaurantId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid business email");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("restaurant_claims").insert({
      restaurant_id: restaurantId,
      user_id: user.id,
      business_email: email.trim(),
      proof_description: proof.trim() || null,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("You already have a pending claim for this restaurant");
      } else {
        console.error("Claim error:", error);
        toast.error("Failed to submit claim");
      }
    } else {
      setSubmitted(true);
      toast.success("Claim submitted! We'll review it shortly.");
    }
    setSubmitting(false);
  };

  if (!user) return null;

  const statusMeta: Record<ClaimStatus, { icon: typeof Clock; label: string; className: string }> = {
    pending: { icon: Clock, label: "Claim pending review", className: "text-amber border-amber/40 bg-amber/5" },
    approved: { icon: CheckCircle, label: "You own this listing", className: "text-success border-success/40 bg-success/5" },
    rejected: { icon: XCircle, label: "Previous claim rejected — resubmit", className: "text-destructive border-destructive/40 bg-destructive/5" },
  };

  if (loadingExisting) {
    return (
      <Button variant="outline" size="sm" className="gap-2 w-full" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking…
      </Button>
    );
  }

  if (existing && existing.status !== "rejected") {
    const meta = statusMeta[existing.status];
    const Icon = meta.icon;
    return (
      <div className={cn("flex items-center gap-2 w-full px-3 py-2 rounded-md border text-xs sm:text-sm", meta.className)}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="font-medium">{meta.label}</span>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full">
          <Building2 className="w-4 h-4" />
          {existing?.status === "rejected" ? "Resubmit claim" : "Own this restaurant?"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Claim {restaurantName}</DialogTitle>
          <DialogDescription>
            Verify your ownership to manage your listing and respond to reviews.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="font-semibold mb-1">Claim Submitted!</p>
            <p className="text-sm text-muted-foreground">
              We'll review your claim and get back to you within 48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-email">Business Email *</Label>
              <Input
                id="business-email"
                type="email"
                placeholder="owner@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof">Proof of Ownership (Optional)</Label>
              <Textarea
                id="proof"
                placeholder="Describe how you can verify ownership (business license, social media access, etc.)"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
              {submitting ? "Submitting..." : "Submit Claim"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
