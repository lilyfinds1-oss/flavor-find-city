import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, ArrowLeft, Zap, Sparkles, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/seo/SEOHead";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast({ title: "Check your email", description: "We sent you a password reset link." });
        setIsForgotPassword(false);
      } else if (isLogin) {
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
            data: { full_name: name, referral_code: referralCode || undefined },
          },
        });
        if (error) throw error;
        setSignupSuccess(true);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <SEOHead title={isForgotPassword ? "Forgot Password" : isLogin ? "Sign In" : "Create Account"} description="Sign in to CityBites to discover restaurants, write reviews, and earn XP." />
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

          {/* Signup success banner */}
          {signupSuccess && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6 animate-fade-in-up">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">Check your email!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
                  </p>
                  <button
                    onClick={async () => {
                      await supabase.auth.resend({ type: "signup", email });
                      toast({ title: "Email resent!", description: "Check your inbox again." });
                    }}
                    className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mt-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Resend verification email
                  </button>
                </div>
              </div>
            </div>
          )}

          <h1 className="font-display text-3xl font-bold text-foreground mb-2 animate-fade-in-up">
            {isForgotPassword ? "Reset password" : isLogin ? "Welcome back" : "Join CityBites"}
          </h1>
          <p className="text-muted-foreground mb-8 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
            {isForgotPassword
              ? "Enter your email and we'll send you a reset link"
              : isLogin 
                ? "Sign in to continue your food journey" 
                : "Create an account to discover, review, and earn"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {!isLogin && !isForgotPassword && (
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

            {!isForgotPassword && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
            )}

            <Button 
              type="submit" 
              variant="hero" 
              size="xl" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isForgotPassword ? (
                "Send Reset Link"
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full gap-3"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-8">
            {isForgotPassword ? (
              <button onClick={() => setIsForgotPassword(false)} className="text-primary font-medium hover:underline">
                ← Back to Sign In
              </button>
            ) : (
              <>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setSignupSuccess(false); }} 
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </>
            )}
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
