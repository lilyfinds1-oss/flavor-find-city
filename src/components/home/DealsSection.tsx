import { Link } from "react-router-dom";
import { ChevronRight, Gift, Clock, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const deals = [
  {
    id: "1",
    restaurant: "The Smokehouse BBQ",
    restaurantSlug: "smokehouse-bbq",
    title: "20% Off Your First Visit",
    description: "Valid on all menu items. Dine-in only.",
    discount: "20% OFF",
    xpCost: 500,
    expiresIn: "3 days",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    restaurant: "Sakura Sushi",
    restaurantSlug: "sakura-sushi",
    title: "Free Miso Soup",
    description: "With any main dish purchase over $25.",
    discount: "FREE ITEM",
    xpCost: 200,
    expiresIn: "5 days",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    restaurant: "Spice Garden",
    restaurantSlug: "spice-garden",
    title: "Buy 1 Get 1 Free",
    description: "On all biryani dishes. Weekdays only.",
    discount: "BOGO",
    xpCost: 750,
    expiresIn: "7 days",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
  },
];

export function DealsSection() {
  return (
    <section className="py-10 sm:py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber/20">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-amber-dark" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                Exclusive Deals
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
                Redeem your XP for amazing discounts
              </p>
            </div>
          </div>
          <Link
            to="/deals"
            className="hidden sm:flex items-center gap-1 text-primary font-medium hover:underline text-sm"
          >
            View all deals
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 stagger-children">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="group bg-card rounded-2xl border border-border/50 overflow-hidden card-hover"
            >
              {/* Image */}
              <div className="relative h-32 sm:h-40 overflow-hidden">
                <img
                  src={deal.image}
                  alt={deal.restaurant}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-3 left-3 bg-gradient-gold text-charcoal font-bold border-0 text-xs sm:text-sm">
                  {deal.discount}
                </Badge>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <Link
                  to={`/restaurant/${deal.restaurantSlug}`}
                  className="text-xs sm:text-sm text-primary font-medium hover:underline"
                >
                  {deal.restaurant}
                </Link>
                <h3 className="font-display font-semibold text-base sm:text-lg mt-1">{deal.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{deal.description}</p>

                <div className="flex items-center justify-between mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 text-amber font-semibold">
                      <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {deal.xpCost} XP
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {deal.expiresIn}
                    </div>
                  </div>
                  <Button variant="gold" size="sm" className="text-xs sm:text-sm h-7 sm:h-8">
                    Get Deal
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile view all link */}
        <div className="flex sm:hidden justify-center mt-4">
          <Link to="/deals">
            <Button variant="outline" size="sm" className="gap-1">
              View all deals
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* XP Banner */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-amber/20 to-primary/20 rounded-2xl border border-amber/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-xl bg-amber/30 xp-glow shrink-0">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-amber-dark" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-display font-bold text-base sm:text-lg">Earn XP, Get Rewards</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Write reviews, vote for restaurants, and earn XP to unlock exclusive deals!
                </p>
              </div>
            </div>
            <Link to="/auth">
              <Button variant="gold" size="lg" className="shrink-0">
                Start Earning
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
