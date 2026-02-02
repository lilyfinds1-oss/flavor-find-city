import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, MapPin, User, Sparkles, Trophy, ChevronDown, Shield, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/top-100", label: "Top 100" },
  { href: "/deals", label: "Deals", badge: "New" },
  { href: "/map", label: "Map" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, loading, isAdmin, signOut } = useAuth();

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const getDisplayName = () => {
    return user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  };

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
            <span className="text-sm">Lahore</span>
            <ChevronDown className="w-3 h-3" />
          </Button>

          {/* Auth / User Menu */}
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm font-medium max-w-24 truncate">
                    {getDisplayName()}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{getDisplayName()}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/leaderboard" className="cursor-pointer">
                    <Trophy className="w-4 h-4 mr-2 text-amber" />
                    Leaderboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/top-posts" className="cursor-pointer">
                    <Trophy className="w-4 h-4 mr-2 text-amber" />
                    Top Posts
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="w-4 h-4 mr-2 text-primary" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
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
              <Button size="sm" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            </Link>
          )}

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
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary"
                >
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-medium">Admin Dashboard</span>
                </Link>
              )}
            </div>
            {user && (
              <div className="border-t border-border mt-2 pt-2">
                <button
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-secondary w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
