import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, MapPin, User, Sparkles, Trophy, ChevronDown, Shield, LogOut, Zap, CreditCard, Users, MoreHorizontal, Map, Tag, Star, BookOpen, MessageSquare, Heart, UtensilsCrossed, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCity } from "@/contexts/CityContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const primaryNavLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/top-100", label: "Top 100" },
  { href: "/community", label: "Community" },
  { href: "/deals", label: "Deals" },
];

const moreNavLinks = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/top-posts", label: "Reviews", icon: Star },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const allNavLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/top-100", label: "Top 100" },
  { href: "/community", label: "Community" },
  { href: "/deals", label: "Deals" },
  { href: "/map", label: "Map" },
  { href: "/top-posts", label: "Reviews" },
  { href: "/blog", label: "Blog" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const { city, cities, setCity } = useCity();

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

  const isMoreActive = moreNavLinks.some((link) => location.pathname === link.href);

  return (
    <header className="sticky top-0 z-50 w-full glass-heavy border-b border-border/30">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-ai flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-ai/30 transition-shadow duration-300">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-ai opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300" />
          </div>
          <span className="font-display font-bold text-xl text-foreground tracking-tight">
            City<span className="gradient-text">Bites</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {primaryNavLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "relative px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                location.pathname === link.href
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {link.label}
              {location.pathname === link.href && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          ))}

          {/* More dropdown for secondary nav items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200",
                  isMoreActive
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                More
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {moreNavLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link to={link.href} className="cursor-pointer">
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* AI Assistant Button */}
          <Link to="/assistant" className="hidden sm:block">
            <Button variant="ai" size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden xl:inline">Ask AI</span>
            </Button>
          </Link>

          {/* Search */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="w-4 h-4" />
          </Button>

          {/* Notifications */}
          <NotificationBell />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* City Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-muted-foreground hover:text-foreground px-2">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm max-w-[80px] truncate">{city?.name || "City"}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {cities.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => setCity(c)}
                  className={cn("cursor-pointer", c.slug === city?.slug && "bg-muted font-medium")}
                >
                  <MapPin className="w-3.5 h-3.5 mr-2" />
                  {c.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={() => navigate("/select-city")} className="cursor-pointer text-primary">
                View All Cities
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Auth / User Menu */}
          {loading ? (
            <div className="w-8 h-8 rounded-full shimmer" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 px-2 hover:bg-muted/50">
                  <Avatar className="w-8 h-8 border-2 border-border">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass border-border/50">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/community" className="cursor-pointer">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    My Posts
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/ai-tools" className="cursor-pointer">
                    <Sparkles className="w-4 h-4 mr-2 text-primary" />
                    AI Tools
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
                  <Link to="/billing" className="cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/install" className="cursor-pointer">
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="w-4 h-4 mr-2 text-ai-pulse" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button size="sm" variant="default" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 glass-heavy border-b border-border/30 animate-slide-in-bottom">
          <nav className="container py-4 flex flex-col gap-1">
            {allNavLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl transition-colors",
                  location.pathname === link.href
                    ? "text-foreground bg-muted"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
            <div className="border-t border-border/30 mt-2 pt-2">
              <Link
                to="/assistant"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted/50"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-ai flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium">AI Food Assistant</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-ai-pulse/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-ai-pulse" />
                  </div>
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              )}
            </div>
            {user && (
              <div className="border-t border-border/30 mt-2 pt-2">
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
