import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Save, User, Star, MessageSquare, Award, Loader2 } from "lucide-react";
import { ReferralSection } from "@/components/profile/ReferralSection";
import { PushNotificationToggle } from "@/components/layout/PushNotificationToggle";
import { BADGES, BadgeDisplay, getEarnedBadges, getProgress } from "@/components/gamification/BadgeSystem";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  xp_points: number | null;
  total_reviews: number | null;
  total_votes: number | null;
  total_photos: number | null;
  total_referrals: number | null;
  is_verified_foodie: boolean | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading, roles } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error) {
      toast.error("Failed to load profile");
    } else if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setLocation(data.location || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null, bio: bio.trim() || null, location: location.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) toast.error("Failed to save profile");
    else { toast.success("Profile updated!"); fetchProfile(); }
    setSaving(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { toast.error("Upload failed"); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq("id", user.id);
    if (updateError) toast.error("Failed to update");
    else { toast.success("Avatar updated!"); fetchProfile(); }
    setUploading(false);
  };

  const getUserInitials = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getRoleBadge = () => {
    if (roles.includes("admin")) return { label: "Admin", variant: "default" as const };
    if (roles.includes("moderator")) return { label: "Moderator", variant: "secondary" as const };
    if (roles.includes("writer")) return { label: "Writer", variant: "outline" as const };
    return { label: "Member", variant: "outline" as const };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const roleBadge = getRoleBadge();
  const stats = {
    reviews: profile?.total_reviews || 0,
    votes: profile?.total_votes || 0,
    photos: profile?.total_photos || 0,
    xp: profile?.xp_points || 0,
    referrals: profile?.total_referrals || 0,
  };
  const earnedBadges = getEarnedBadges(stats);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground text-sm">Manage your profile and settings</p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {/* Avatar & Stats Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center pb-3 sm:pb-6">
              <div className="relative mx-auto">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xl sm:text-2xl font-bold bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1.5 sm:p-2 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              </div>
              <CardTitle className="mt-3 sm:mt-4 text-base sm:text-lg">{displayName || "Foodie"}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{user.email}</CardDescription>
              <Badge variant={roleBadge.variant} className="mt-2 text-xs">
                {roleBadge.label}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber" />
                    <span className="text-xs sm:text-sm">XP Points</span>
                  </div>
                  <span className="font-bold text-sm">{stats.xp}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span className="text-xs sm:text-sm">Reviews</span>
                  </div>
                  <span className="font-bold text-sm">{stats.reviews}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                    <span className="text-xs sm:text-sm">Votes Given</span>
                  </div>
                  <span className="font-bold text-sm">{stats.votes}</span>
                </div>
                {profile?.is_verified_foodie && (
                  <Badge variant="default" className="w-full justify-center text-xs">
                    ✓ Verified Foodie
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Edit Profile</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-sm">Display Name</Label>
                <Input id="displayName" placeholder="Your display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm">Location</Label>
                <Input id="location" placeholder="e.g., Lahore, Pakistan" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={500} />
                <p className="text-[10px] sm:text-xs text-muted-foreground text-right">{bio.length}/500</p>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card className="md:col-span-3">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Badges ({earnedBadges.length}/{BADGES.length})
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">Earn badges by being active in the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
                {BADGES.map((badge) => {
                  const earned = earnedBadges.some(b => b.id === badge.id);
                  const progress = getProgress(badge, stats);
                  return (
                    <BadgeDisplay
                      key={badge.id}
                      badge={badge}
                      earned={earned}
                      progress={progress}
                      size="md"
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Push Notifications</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Get notified about new deals and trending restaurants</CardDescription>
              </CardHeader>
              <CardContent>
                <PushNotificationToggle />
              </CardContent>
            </Card>
          </div>

          {/* Referral Section */}
          <div className="md:col-span-3">
            <ReferralSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
