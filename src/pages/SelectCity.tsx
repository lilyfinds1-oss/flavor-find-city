import { useCity, City } from "@/contexts/CityContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/seo/SEOHead";

const cityEmojis: Record<string, string> = {
  lahore: "🏰",
  karachi: "🌊",
  islamabad: "🏔️",
  faisalabad: "🏭",
  multan: "☀️",
};

const cityTaglines: Record<string, string> = {
  lahore: "City of Gardens & Food",
  karachi: "City of Lights",
  islamabad: "The Beautiful Capital",
  faisalabad: "Manchester of Pakistan",
  multan: "City of Saints",
};

export default function SelectCity() {
  const { cities, setCity, isLoading } = useCity();
  const navigate = useNavigate();

  const handleSelect = (city: City) => {
    setCity(city);
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <SEOHead title="Select Your City — CityBites" description="Choose your city to discover the best restaurants, deals, and food experiences near you." />
      
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <span className="font-display font-bold text-3xl text-foreground tracking-tight">
            City<span className="gradient-text">Bites</span>
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3">
            Where are you <span className="gradient-text">eating</span>?
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
            Select your city to get personalized restaurant recommendations, deals, and more.
          </p>
        </div>

        {/* City grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
          {cities.map((city, index) => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className={cn(
                "group relative p-6 rounded-2xl border-2 border-border bg-card",
                "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
                "transition-all duration-300 hover:-translate-y-1",
                "text-left"
              )}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{cityEmojis[city.slug] || "🏙️"}</span>
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">{city.name}</h2>
              <p className="text-sm text-muted-foreground">{cityTaglines[city.slug] || "Discover amazing food"}</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>{city.neighborhoods.length} neighborhoods</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
