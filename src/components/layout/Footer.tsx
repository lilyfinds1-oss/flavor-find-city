import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-2xl font-bold mb-2">
              Get the best food finds in your inbox
            </h3>
            <p className="text-cream/70 mb-6">
              Weekly trending restaurants, exclusive deals, and hidden gems.
            </p>
            <form className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-cream placeholder:text-cream/50"
              />
              <Button variant="hero">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-sm">🍽️</span>
              </div>
              <span className="font-display font-bold text-lg">CityBites</span>
            </Link>
            <p className="text-sm text-cream/60 mb-4">
              Discover the best restaurants, earn rewards, and never eat boring food again.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-cream/60 hover:text-cream transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream/60 hover:text-cream transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream/60 hover:text-cream transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-cream/60 hover:text-cream transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-display font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/explore" className="text-cream/60 hover:text-cream transition-colors">All Restaurants</Link></li>
              <li><Link to="/top-100" className="text-cream/60 hover:text-cream transition-colors">Top 100</Link></li>
              <li><Link to="/categories" className="text-cream/60 hover:text-cream transition-colors">Categories</Link></li>
              <li><Link to="/map" className="text-cream/60 hover:text-cream transition-colors">Map View</Link></li>
              <li><Link to="/deals" className="text-cream/60 hover:text-cream transition-colors">Deals & Coupons</Link></li>
            </ul>
          </div>

          {/* Top Lists */}
          <div>
            <h4 className="font-display font-semibold mb-4">Top Lists</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/lists/steak" className="text-cream/60 hover:text-cream transition-colors">Best Steakhouses</Link></li>
              <li><Link to="/lists/desi" className="text-cream/60 hover:text-cream transition-colors">Best Desi Food</Link></li>
              <li><Link to="/lists/cafes" className="text-cream/60 hover:text-cream transition-colors">Best Cafes</Link></li>
              <li><Link to="/lists/bbq" className="text-cream/60 hover:text-cream transition-colors">Best BBQ</Link></li>
              <li><Link to="/lists/halal" className="text-cream/60 hover:text-cream transition-colors">Best Halal</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-cream/60 hover:text-cream transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-cream/60 hover:text-cream transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-cream/60 hover:text-cream transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-cream/60 hover:text-cream transition-colors">Contact</Link></li>
              <li><Link to="/for-restaurants" className="text-cream/60 hover:text-cream transition-colors">For Restaurants</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-cream/50">
          <p>© 2024 CityBites. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-cream transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-cream transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
