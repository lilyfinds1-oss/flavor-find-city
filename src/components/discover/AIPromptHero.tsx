import { useState, useEffect, useRef } from "react";
import { Sparkles, Mic, ArrowRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCity } from "@/contexts/CityContext";

interface AIPromptHeroProps {
  onSearch: (query: string) => void;
}

const quickChips = [
  { emoji: "🔥", text: "Trending now", query: "What's trending right now?" },
  { emoji: "💑", text: "Date night", query: "Romantic dinner for two" },
  { emoji: "🍕", text: "Quick bite", query: "Fast casual under 20 min" },
  { emoji: "🌿", text: "Healthy", query: "Healthy food options" },
  { emoji: "🌙", text: "Late night", query: "Open late night" },
  { emoji: "💰", text: "Budget friendly", query: "Great food under 1500 PKR" },
];

export function AIPromptHero({ onSearch }: AIPromptHeroProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { city } = useCity();

  useEffect(() => {
    const updateTimeContext = () => {
      const now = new Date();
      const hour = now.getHours();
      const timeStr = now.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      });
      setCurrentTime(timeStr);

      if (hour < 11) {
        setGreeting("Good morning");
      } else if (hour < 15) {
        setGreeting("Hungry for lunch?");
      } else if (hour < 18) {
        setGreeting("Afternoon cravings?");
      } else if (hour < 21) {
        setGreeting("Dinner time");
      } else {
        setGreeting("Late night munchies?");
      }
    };

    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleChipClick = (chipQuery: string) => {
    setQuery(chipQuery);
    onSearch(chipQuery);
  };

  return (
    <section className="relative min-h-[68vh] sm:min-h-[75vh] flex flex-col items-center justify-center px-4 pt-16 pb-12 sm:pt-24 sm:pb-20 overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-ai-pulse/5 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Context indicators */}
      <div className="relative z-10 flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 text-sm text-muted-foreground animate-fade-in">
        <span className="flex items-center gap-1.5 chip">
          <MapPin className="w-3.5 h-3.5" />
          {city?.name || "Pakistan"}
        </span>
        <span className="flex items-center gap-1.5 chip">
          <Clock className="w-3.5 h-3.5" />
          {currentTime}
        </span>
      </div>

      {/* Main prompt area */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Greeting */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 animate-fade-in-up">
          {greeting} <span className="gradient-text-ai">✨</span>
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Tell me what you're in the mood for
        </p>

        {/* AI Input */}
        <form onSubmit={handleSubmit} className="relative animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div
            className={cn(
              "relative flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-2xl transition-all duration-500",
              "bg-card border-2",
              isFocused 
                ? "border-primary/50 shadow-lg shadow-primary/10" 
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            {/* AI indicator */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 shrink-0",
              isFocused ? "bg-gradient-ai" : "bg-muted"
            )}>
              <Sparkles className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                isFocused ? "text-white" : "text-muted-foreground"
              )} />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What are you craving right now?"
              className="flex-1 min-w-0 bg-transparent text-base sm:text-lg text-foreground placeholder:text-muted-foreground focus:outline-none py-2 sm:py-3"
            />

            {/* Voice button (UI only) - hidden on small mobile */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-xl text-muted-foreground hover:text-foreground hidden sm:flex shrink-0"
            >
              <Mic className="w-5 h-5" />
            </Button>

            {/* Submit button */}
            <Button
              type="submit"
              variant="ai"
              size="lg"
              className={cn(
                "rounded-xl transition-all duration-300 shrink-0 h-10 w-10 sm:h-auto sm:w-auto p-0 sm:px-4",
                query.trim() ? "opacity-100 scale-100" : "opacity-50 scale-95"
              )}
              disabled={!query.trim()}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Glow effect when focused */}
          {isFocused && (
            <div className="absolute -inset-1 bg-gradient-ai rounded-3xl opacity-20 blur-xl -z-10 animate-pulse-glow" />
          )}
        </form>

        {/* Quick chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 sm:mt-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          {quickChips.map((chip, index) => (
            <button
              key={index}
              onClick={() => handleChipClick(chip.query)}
              className="chip hover:bg-muted/80 hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm"
            >
              <span>{chip.emoji}</span>
              <span>{chip.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-muted-foreground animate-bounce-subtle">
        <span className="text-xs uppercase tracking-wider">Discover</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted-foreground/50 to-transparent" />
      </div>
    </section>
  );
}
