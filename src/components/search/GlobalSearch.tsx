import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, MapPin, Star, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  neighborhood: string | null;
  cuisines: string[] | null;
  average_rating: number | null;
  cover_image: string | null;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from("restaurants")
        .select("id, name, slug, neighborhood, cuisines, average_rating, cover_image")
        .or(`name.ilike.%${query}%,neighborhood.ilike.%${query}%,address.ilike.%${query}%`)
        .limit(8);

      setResults(data || []);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (slug: string) => {
    onClose();
    navigate(`/restaurant/${slug}`);
  };

  const handleExplore = () => {
    onClose();
    navigate(`/explore?q=${encodeURIComponent(query)}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div
        className="relative max-w-2xl mx-auto mt-20 px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-scale-in">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search restaurants, cuisines, neighborhoods..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") onClose();
                if (e.key === "Enter" && query) handleExplore();
              }}
              className="border-0 bg-transparent h-14 text-lg focus-visible:ring-0 px-0"
            />
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="p-6 text-center text-muted-foreground text-sm">Searching...</div>
            )}

            {!loading && results.length > 0 && (
              <div className="p-2">
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => handleSelect(r.slug)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {r.cover_image && (
                        <img src={r.cover_image} alt={r.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {r.neighborhood && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {r.neighborhood}
                          </span>
                        )}
                        {r.average_rating && Number(r.average_rating) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber" />
                            {Number(r.average_rating).toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    {r.cuisines && r.cuisines.length > 0 && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {r.cuisines[0].replace("_", " ")}
                      </Badge>
                    )}
                  </button>
                ))}
                {query && (
                  <button
                    onClick={handleExplore}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-primary text-sm font-medium"
                  >
                    <TrendingUp className="w-4 h-4" />
                    View all results for "{query}"
                  </button>
                )}
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-2">No restaurants found for "{query}"</p>
                <button
                  onClick={handleExplore}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Search on Explore page →
                </button>
              </div>
            )}

            {!query && (
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-3 px-2">Quick Filters</p>
                <div className="flex flex-wrap gap-2 px-2">
                  {["Halal", "Desi", "Fine Dining", "Gulberg", "DHA", "Pizza", "BBQ"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="chip text-xs"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-5 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">ESC</kbd> to close
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">↵</kbd> to explore
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
