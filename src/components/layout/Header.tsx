import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, MapPin, User, Sparkles, Trophy, Gift, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/top-100", label: "Top 100" },
  { href: "/deals", label: "Deals", badge: "New" },
  { href: "/map", label: "Map" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
            <span className="text-lg">🍽️</span>
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            City<span className="text-primary">Bites</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                location.pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {link.label}
              {link.badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-gradient-primary text-primary-foreground rounded-full">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* AI Assistant Button */}
          <Link to="/assistant" className="hidden sm:block">
            <Button variant="glass" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="hidden lg:inline">What to eat?</span>
            </Button>
          </Link>

          {/* Search */}
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="w-5 h-5" />
          </Button>

          {/* Location */}
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Toronto</span>
            <ChevronDown className="w-3 h-3" />
          </Button>

          {/* Auth */}
          <Link to="/auth">
            <Button size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          </Link>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border animate-slide-in-bottom">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                  location.pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                <span className="font-medium">{link.label}</span>
                {link.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-gradient-primary text-primary-foreground rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary"
              >
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-medium">AI Food Assistant</span>
              </Link>
              <Link
                to="/leaderboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary"
              >
                <Trophy className="w-5 h-5 text-amber" />
                <span className="font-medium">Leaderboard</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
