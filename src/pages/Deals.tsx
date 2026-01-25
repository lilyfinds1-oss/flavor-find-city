import { Link } from "react-router-dom";
import { Gift, Clock, Ticket, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const deals = [
  {
    id: "1",
    restaurant: "The Smokehouse BBQ",
    restaurantSlug: "smokehouse-bbq",
    title: "20% Off Your First Visit",
    description: "Valid on all menu items. Dine-in only. Cannot be combined with other offers.",
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
    description: "With any main dish purchase over $25. Valid for dine-in and takeout.",
    discount: "FREE ITEM",
    xpCost: 200,
    expiresIn: "5 days",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    restaurant: "Spice Garden",
    restaurantSlug: "spice-garden",
    title: "Buy 1 Get 1 Free Biryani",
    description: "On all biryani dishes. Weekdays only. Dine-in preferred.",
    discount: "BOGO",
    xpCost: 750,
    expiresIn: "7 days",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    restaurant: "Prime Steakhouse",
    restaurantSlug: "prime-steakhouse",
    title: "$50 Off $200+ Orders",
    description: "Perfect for celebrations. Reservations required. Excludes alcohol.",
    discount: "$50 OFF",
    xpCost: 1500,
    expiresIn: "14 days",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    restaurant: "Chai & Toast Cafe",
    restaurantSlug: "chai-toast-cafe",
    title: "Free Pastry with Coffee",
    description: "Any specialty coffee comes with a free pastry of your choice.",
    discount: "FREE ITEM",
    xpCost: 150,
    expiresIn: "10 days",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    restaurant: "Seoul Kitchen",
    restaurantSlug: "seoul-kitchen",
    title: "15% Off Korean BBQ",
    description: "Valid on all Korean BBQ sets for groups of 4 or more.",
    discount: "15% OFF",
    xpCost: 600,
    expiresIn: "5 days",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop",
  },
];

export default function Deals() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-r from-amber/20 to-primary/20 border-b border-border">
          <div className="container py-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/30 text-amber-dark mb-4">
              <Gift className="w-5 h-5" />
              <span className="font-semibold">Exclusive Rewards</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Deals & Coupons
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Use your XP points to unlock exclusive deals at top restaurants. Earn more by reviewing and voting!
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-card rounded-full px-6 py-3 border border-border">
              <Ticket className="w-5 h-5 text-amber" />
              <span className="font-semibold">Your XP Balance:</span>
              <span className="text-2xl font-display font-bold text-amber">0 XP</span>
              <Link to="/auth">
                <Button variant="gold" size="sm" className="ml-2">Sign in to earn</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="group bg-card rounded-2xl border border-border/50 overflow-hidden card-hover"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.restaurant}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-gradient-gold text-charcoal font-bold border-0 text-sm">
                    {deal.discount}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5">
                  <Link
                    to={`/restaurant/${deal.restaurantSlug}`}
                    className="text-sm text-primary font-medium hover:underline"
                  >
                    {deal.restaurant}
                  </Link>
                  <h3 className="font-display font-semibold text-lg mt-1">{deal.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{deal.description}</p>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 text-amber font-semibold">
                        <Ticket className="w-4 h-4" />
                        {deal.xpCost} XP
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {deal.expiresIn}
                      </div>
                    </div>
                    <Button variant="gold" size="sm">
                      Redeem
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-secondary/30 border-t border-border">
          <div className="container py-12">
            <h2 className="font-display text-2xl font-bold text-center mb-8">How to Earn XP</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: "✍️", title: "Write Reviews", xp: "+50 XP", desc: "Share your dining experience" },
                { icon: "⬆️", title: "Vote for Restaurants", xp: "+10 XP", desc: "Help rank the best places" },
                { icon: "📸", title: "Upload Photos", xp: "+20 XP", desc: "Show off the food" },
              ].map((item, i) => (
                <div key={i} className="bg-card rounded-xl p-6 text-center border border-border">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-display font-semibold text-lg">{item.title}</h3>
                  <p className="text-amber font-bold mt-1">{item.xp}</p>
                  <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
