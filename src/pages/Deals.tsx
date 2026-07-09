import { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Link } from "react-router-dom";
import { Gift, Clock, Ticket, Loader2, Filter, Flame, Users, Utensils, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeals, useUserXP, useRedeemDeal, type Deal } from "@/hooks/useDeals";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { celebrateXP } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

const getDealBadge = (dealType: string, discountValue: number | null) => {
  switch (dealType) {
    case "percentage": return `${discountValue}% OFF`;
    case "fixed": return `Rs. ${discountValue} OFF`;
    case "bogo": return "BOGO";
    case "free_item": return "FREE ITEM";
    default: return "DEAL";
  }
};

const PRICES = ["$", "$$", "$$$", "$$$$"] as const;
const CUISINES = ["desi", "bbq", "chinese", "italian", "cafe", "bakery", "burger", "pizza", "seafood"] as const;

type Filters = {
  price: string[];
  cuisines: string[];
  halal: boolean;
  familyFriendly: boolean;
  openNow: boolean;
};

const emptyFilters: Filters = { price: [], cuisines: [], halal: false, familyFriendly: false, openNow: false };

function isOpenNow(hours: any): boolean {
  if (!hours || typeof hours !== "object") return true; // unknown → don't hide
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const now = new Date();
  const key = days[now.getDay()];
  const today = hours[key] ?? hours[key + "day"];
  if (!today) return true;
  const s = String(today).toLowerCase();
  if (s.includes("closed")) return false;
  return true;
}

export default function Deals() {
  const { user } = useAuth();
  const { data: deals, isLoading } = useDeals();
  const { data: userXP = 0 } = useUserXP();
  const redeemDeal = useRedeemDeal();
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  const toggleInList = (key: "price" | "cuisines", v: string) => {
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v],
    }));
  };

  const filtered = useMemo<Deal[]>(() => {
    if (!deals) return [];
    return deals.filter((d) => {
      const r = d.restaurant;
      if (filters.price.length && !filters.price.includes(r?.price_range || "")) return false;
      if (filters.cuisines.length) {
        const rc = (r?.cuisines || []) as string[];
        if (!rc.some((c) => filters.cuisines.includes(c))) return false;
      }
      if (filters.halal && !r?.is_halal) return false;
      if (filters.familyFriendly && !r?.is_family_friendly) return false;
      if (filters.openNow && !isOpenNow(r?.hours)) return false;
      return true;
    });
  }, [deals, filters]);

  const activeCount =
    filters.price.length + filters.cuisines.length +
    (filters.halal ? 1 : 0) + (filters.familyFriendly ? 1 : 0) + (filters.openNow ? 1 : 0);

  const handleRedeem = (dealId: string, xpCost: number) => {
    if (!user) return;
    redeemDeal.mutate(
      { dealId, xpCost },
      { onSuccess: () => celebrateXP(xpCost) }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title="Deals & Coupons" description="Redeem exclusive restaurant deals using your XP points. Earn rewards by reviewing and voting." />
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-r from-amber/20 to-primary/20 border-b border-border">
          <div className="container py-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/30 text-amber-dark mb-4">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Exclusive Rewards</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Deals & Coupons</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use your XP points to unlock exclusive deals at top restaurants. Earn more by reviewing and voting!
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-card rounded-full px-6 py-3 border border-border">
              <Ticket className="w-5 h-5 text-amber" />
              <span className="font-semibold">Your XP Balance:</span>
              <span className="text-2xl font-display font-bold text-amber">{userXP} XP</span>
              {!user && (
                <Link to="/auth">
                  <Button variant="gold" size="sm" className="ml-2">Sign in to earn</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sticky animated filters */}
        <div className="sticky top-16 z-30 backdrop-blur-xl bg-background/70 border-b border-border/60">
          <div className="container py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 pr-2 border-r border-border/50 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              <AnimatePresence>
                {activeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="ml-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                  >{activeCount}</motion.span>
                )}
              </AnimatePresence>
            </div>

            <FilterChip
              icon={<Flame className="w-3.5 h-3.5" />}
              active={filters.openNow}
              onClick={() => setFilters((f) => ({ ...f, openNow: !f.openNow }))}
              label="Open now"
            />
            <FilterChip
              active={filters.halal}
              onClick={() => setFilters((f) => ({ ...f, halal: !f.halal }))}
              label="Halal"
            />
            <FilterChip
              icon={<Users className="w-3.5 h-3.5" />}
              active={filters.familyFriendly}
              onClick={() => setFilters((f) => ({ ...f, familyFriendly: !f.familyFriendly }))}
              label="Family friendly"
            />

            <span className="mx-1 h-5 w-px bg-border/60 shrink-0" />
            {PRICES.map((p) => (
              <FilterChip
                key={p}
                active={filters.price.includes(p)}
                onClick={() => toggleInList("price", p)}
                label={p}
              />
            ))}

            <span className="mx-1 h-5 w-px bg-border/60 shrink-0" />
            <Utensils className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            {CUISINES.map((c) => (
              <FilterChip
                key={c}
                active={filters.cuisines.includes(c)}
                onClick={() => toggleInList("cuisines", c)}
                label={c.replace("_", " ")}
              />
            ))}

            <AnimatePresence>
              {activeCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  onClick={() => setFilters(emptyFilters)}
                  className="ml-auto shrink-0 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" /> Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <LayoutGroup>
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filtered.map((deal) => {
                    const restaurantName = deal.restaurant?.name || "Restaurant";
                    const restaurantSlug = deal.restaurant?.slug || "";
                    const coverImage = deal.restaurant?.cover_image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop";
                    const canAfford = userXP >= (deal.xp_cost || 0);
                    const expiresIn = deal.expires_at ? formatDistanceToNow(new Date(deal.expires_at), { addSuffix: false }) : "soon";

                    return (
                      <motion.div
                        key={deal.id}
                        layout
                        initial={{ opacity: 0, y: 18, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 220, damping: 24 }}
                        whileHover={{ y: -4 }}
                        className="group bg-card rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-shadow"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img src={coverImage} alt={restaurantName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-gradient-gold text-charcoal font-bold border-0 text-sm">
                            {getDealBadge(deal.deal_type, deal.discount_value)}
                          </Badge>
                          {deal.restaurant?.is_halal && (
                            <Badge className="absolute top-3 right-3 bg-emerald-500/90 text-white border-0 text-[10px]">Halal</Badge>
                          )}
                        </div>
                        <div className="p-5">
                          <Link to={`/restaurant/${restaurantSlug}`} className="text-sm text-primary font-medium hover:underline">
                            {restaurantName}
                          </Link>
                          <h3 className="font-display font-semibold text-lg mt-1">{deal.title}</h3>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {deal.description || deal.terms}
                          </p>
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-3 text-sm">
                              <div className="flex items-center gap-1 text-amber font-semibold">
                                <Ticket className="w-4 h-4" />
                                {deal.xp_cost} XP
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {expiresIn}
                              </div>
                            </div>
                            {user ? (
                              <Button
                                variant="gold"
                                size="sm"
                                disabled={!canAfford || redeemDeal.isPending}
                                onClick={() => handleRedeem(deal.id, deal.xp_cost || 0)}
                              >
                                {redeemDeal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : canAfford ? "Redeem" : "Need more XP"}
                              </Button>
                            ) : (
                              <Link to="/auth"><Button variant="gold" size="sm">Sign in</Button></Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          ) : (
            <div className="text-center py-16">
              <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">
                {deals && deals.length > 0 ? "No deals match your filters" : "No active deals"}
              </h2>
              <p className="text-muted-foreground">
                {deals && deals.length > 0 ? "Try clearing a filter or two." : "Check back soon for exclusive offers!"}
              </p>
              {activeCount > 0 && (
                <Button variant="ghost" size="sm" className="mt-4" onClick={() => setFilters(emptyFilters)}>
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FilterChip({
  active, onClick, label, icon,
}: { active: boolean; onClick: () => void; label: string; icon?: React.ReactNode }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className={cn(
        "relative shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25"
          : "bg-card/60 text-muted-foreground border-border/60 hover:text-foreground hover:border-border"
      )}
    >
      {active && (
        <motion.span
          layoutId={`chip-${label}`}
          className="absolute inset-0 rounded-full bg-primary -z-10"
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />
      )}
      {icon}
      {label}
    </motion.button>
  );
}
