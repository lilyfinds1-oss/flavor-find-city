import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You're now signed in." });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a verification link." });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 relative">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-ai-pulse/5 rounded-full blur-[120px]" />
        
        <div className="relative max-w-md mx-auto w-full">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-ai flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground tracking-tight">
              City<span className="gradient-text">Bites</span>
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2 animate-fade-in-up">
            {isLogin ? "Welcome back" : "Join CityBites"}
          </h1>
          <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
            {isLogin 
              ? "Sign in to continue your food journey" 
              : "Create an account to discover, review, and earn"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="Your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 rounded-xl" 
                    required 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 rounded-xl" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="pl-11 h-12 bg-muted/50 border-border/50 focus:border-primary/50 rounded-xl" 
                  required 
                  minLength={6} 
                />
              </div>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              size="xl" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-ai-pulse to-accent opacity-90" />
        
        {/* Animated shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-3xl rotate-12 animate-float" />
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-white/10 rounded-2xl -rotate-12 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-xl rotate-45 animate-float" style={{ animationDelay: "2s" }} />
        
        {/* Content */}
        <div className="relative z-10 text-center text-white p-12 max-w-lg">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8 animate-bounce-subtle">
            <Sparkles className="w-10 h-10" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-4">
            Discover. Review. Earn.
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Join thousands of food lovers exploring the best restaurants in Lahore. AI-powered recommendations tailored just for you.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12">
            {[
              { value: "500+", label: "Restaurants" },
              { value: "10K+", label: "Reviews" },
              { value: "5K+", label: "Foodies" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
