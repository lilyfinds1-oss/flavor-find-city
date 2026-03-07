import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AdminOverview from "@/components/admin/AdminOverview";
import RestaurantManager from "@/components/admin/RestaurantManager";
import ReviewModerator from "@/components/admin/ReviewModerator";
import SettingsPanel from "@/components/admin/SettingsPanel";
import UserRoleManager from "@/components/admin/UserRoleManager";
import DealsManager from "@/components/admin/DealsManager";
import ClaimsManager from "@/components/admin/ClaimsManager";
import { Shield, Store, MessageSquare, BarChart3, Settings, Users, Ticket, Building2 } from "lucide-react";

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage restaurants, reviews, and view analytics</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="gap-2">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Restaurants</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Claims</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="deals" className="gap-2">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Deals</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="restaurants">
            <RestaurantManager />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewModerator />
          </TabsContent>

          <TabsContent value="claims">
            <ClaimsManager />
          </TabsContent>

          <TabsContent value="users">
            <UserRoleManager />
          </TabsContent>

          <TabsContent value="deals">
            <DealsManager />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
