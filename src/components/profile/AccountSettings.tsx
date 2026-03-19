import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Globe, Eye, Mail, Shield, Download, ExternalLink, Palette } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function AccountSettings() {
  const { user } = useAuth();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [profilePublic, setProfilePublic] = useState(true);

  const handleToggle = (setter: (v: boolean) => void, label: string) => (checked: boolean) => {
    setter(checked);
    toast.success(`${label} ${checked ? "enabled" : "disabled"}`);
  };

  return (
    <Card className="md:col-span-3">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Account Settings
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Manage your preferences and privacy</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Preferences */}
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <Label htmlFor="email-notifs" className="text-sm cursor-pointer">Review approval & replies</Label>
              <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={handleToggle(setEmailNotifs, "Review notifications")} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <Label htmlFor="deal-alerts" className="text-sm cursor-pointer">Deal alerts for saved restaurants</Label>
              <Switch id="deal-alerts" checked={dealAlerts} onCheckedChange={handleToggle(setDealAlerts, "Deal alerts")} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <Label htmlFor="weekly-digest" className="text-sm cursor-pointer">Weekly food digest</Label>
              <Switch id="weekly-digest" checked={weeklyDigest} onCheckedChange={handleToggle(setWeeklyDigest, "Weekly digest")} />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            Privacy
          </h3>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div>
              <Label htmlFor="public-profile" className="text-sm cursor-pointer">Public profile</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Allow others to see your reviews and activity</p>
            </div>
            <Switch id="public-profile" checked={profilePublic} onCheckedChange={handleToggle(setProfilePublic, "Public profile")} />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Quick Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link to="/install">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <Download className="w-3.5 h-3.5" />
                Install CityBites App
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
                <Shield className="w-3.5 h-3.5" />
                Premium Plans
              </Button>
            </Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Account created</span>
            <span className="text-foreground font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Plan</span>
            <Badge variant="outline" className="text-xs">Free</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
