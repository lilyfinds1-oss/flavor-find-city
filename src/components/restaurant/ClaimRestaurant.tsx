import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Building2, Loader2, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ClaimRestaurantProps {
  restaurantId: string;
  restaurantName: string;
}

export function ClaimRestaurant({ restaurantId, restaurantName }: ClaimRestaurantProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [proof, setProof] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 w-full">
          <Building2 className="w-4 h-4" />
          Own this restaurant?
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
