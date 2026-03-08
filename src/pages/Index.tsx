import { useState } from "react";
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
import { SEOHead } from "@/components/seo/SEOHead";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

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
      <main className="flex-1">
        <AIPromptHero onSearch={handleSearch} />
        <LiveTrendingBar />
        <RecommendedForYou />
        <TopRatedSection />
        <TrendingNowSection />
        <RecentReviewsSection />
        <DealsSection />
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
