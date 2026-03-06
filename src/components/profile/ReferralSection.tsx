import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Check, Share2, Users, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";

export function ReferralSection() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("referral_code, total_referrals")
        .eq("id", user.id)
        .single();
      if (data) {
        setReferralCode((data as any).referral_code);
        setTotalReferrals((data as any).total_referrals || 0);
      }
    };
    fetch();
  }, [user]);

  const referralLink = referralCode
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join CityBites!",
        text: "Discover the best restaurants in Lahore with AI-powered recommendations!",
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  if (!user || !referralCode) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Invite Friends
        </CardTitle>
        <CardDescription>
          Earn 50 XP for each friend who signs up and writes their first review!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={referralLink} readOnly className="text-sm" />
          <Button variant="outline" size="icon" onClick={handleCopy}>
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="font-semibold text-sm">{totalReferrals} friends invited</p>
            <p className="text-xs text-muted-foreground">{totalReferrals * 50} XP earned from referrals</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
