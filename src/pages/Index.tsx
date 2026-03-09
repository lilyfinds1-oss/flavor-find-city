import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AIPromptHero } from "@/components/discover/AIPromptHero";
import { LiveTrendingBar } from "@/components/discover/LiveTrendingBar";
import { DiscoveryFeed } from "@/components/discover/DiscoveryFeed";
import { RecentReviewsSection } from "@/components/home/RecentReviewsSection";
import { TopRatedSection } from "@/components/home/TopRatedSection";
import { TrendingNowSection } from "@/components/home/TrendingNowSection";
import { DealsSection } from "@/components/home/DealsSection";
import { NeighborhoodsSection } from "@/components/home/NeighborhoodsSection";
import { RecommendedForYou } from "@/components/discover/RecommendedForYou";
import { RestaurantOwnersSection } from "@/components/home/RestaurantOwnersSection";
import { SEOHead } from "@/components/seo/SEOHead";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if user has completed onboarding
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data && !data.onboarding_completed) {
          setShowOnboarding(true);
        }
      });
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const feedSection = document.getElementById("discovery-feed");
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead />
      <Header />
      {user && showOnboarding && (
        <OnboardingWizard
          userId={user.id}
          open={showOnboarding}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
      <main className="flex-1">
        <AIPromptHero onSearch={handleSearch} />
        <LiveTrendingBar />
        <RecommendedForYou />
        <TopRatedSection />
        <TrendingNowSection />
        <RecentReviewsSection />
        <DealsSection />
        <RestaurantOwnersSection />
        <NeighborhoodsSection />
        <div id="discovery-feed">
          <DiscoveryFeed searchQuery={searchQuery} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
