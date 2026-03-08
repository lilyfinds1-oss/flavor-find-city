import { Link } from "react-router-dom";
import { Instagram, Twitter, Zap, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  discover: [
    { label: "Explore", href: "/explore" },
    { label: "Top 100", href: "/top-100" },
    { label: "Map", href: "/map" },
    { label: "Deals", href: "/deals" },
    { label: "Reviews", href: "/top-posts" },
  ],
  curated: [
    { label: "Best Biryani", href: "/lists/biryani" },
    { label: "Date Night", href: "/lists/date-night" },
    { label: "Late Night", href: "/lists/late-night" },
    { label: "Hidden Gems", href: "/lists/hidden-gems" },
    { label: "Best BBQ", href: "/lists/bbq" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "For Restaurants", href: "/for-restaurants" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-border/30 bg-card">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />
      
      {/* Newsletter Section */}
      <div className="relative border-b border-border/30">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-ai flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Stay updated
              </span>
            </div>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
              Get the best food finds weekly
            </h3>
            <p className="text-muted-foreground text-sm mb-4 sm:mb-6">
              Curated recommendations, trending spots, and exclusive deals.
            </p>
            <form className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-muted/50 border-border/50 focus:border-primary/50"
              />
              <Button variant="hero" className="shrink-0">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-ai flex items-center justify-center shadow-lg shadow-primary/10">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground tracking-tight">
                City<span className="gradient-text">Bites</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              AI-powered food discovery. Find your next favorite meal in Lahore.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Discover</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {footerLinks.discover.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Curated Lists */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Curated</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {footerLinks.curated.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    to={link.href} 
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/30 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <p>© 2026 CityBites. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
