import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AIPromptHero } from "@/components/discover/AIPromptHero";
import { LiveTrendingBar } from "@/components/discover/LiveTrendingBar";
import { DiscoveryFeed } from "@/components/discover/DiscoveryFeed";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Scroll to feed
    const feedSection = document.getElementById("discovery-feed");
    if (feedSection) {
      feedSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <AIPromptHero onSearch={handleSearch} />
        <LiveTrendingBar />
        <div id="discovery-feed">
          <DiscoveryFeed searchQuery={searchQuery} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
