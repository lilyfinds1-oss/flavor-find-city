import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap, Rocket, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/seo/SEOHead";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Basic restaurant listing",
    icon: Zap,
    features: [
      { label: "Restaurant listing", included: true },
      { label: "Customer reviews", included: true },
      { label: "Basic analytics", included: true },
      { label: "AI Marketing Assistant", included: false },
      { label: "AI Menu Intelligence", included: false },
      { label: "Unlimited AI generations", included: false },
    ],
    cta: "Current Plan",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "AI-powered marketing for your restaurant",
    icon: Sparkles,
    features: [
      { label: "Everything in Free", included: true },
      { label: "AI Marketing Assistant", included: true },
      { label: "Instagram & Facebook posts", included: true },
      { label: "5 AI generations per day", included: true },
      { label: "AI Menu Intelligence", included: false },
      { label: "Unlimited AI generations", included: false },
    ],
    cta: "Get Started",
    variant: "default" as const,
    popular: false,
  },
  {
    name: "Growth",
    price: "$39",
    period: "/month",
    description: "Full AI suite for restaurant growth",
    icon: Crown,
    features: [
      { label: "Everything in Starter", included: true },
      { label: "AI Menu Intelligence", included: true },
      { label: "Auto-extract dishes from menus", included: true },
      { label: "Unlimited AI generations", included: true },
      { label: "Priority AI processing", included: true },
      { label: "Advanced analytics", included: true },
    ],
    cta: "Upgrade to Growth",
    variant: "default" as const,
    popular: true,
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = (planName: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (planName === "Free") return;
    navigate(`/restaurant-subscribe?plan=${planName.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Pricing — CityBites AI Restaurant Tools"
        description="Unlock AI-powered marketing, menu intelligence, and growth tools for your restaurant. Plans starting at $19/month."
      />
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Rocket className="w-3 h-3 mr-1" />
            Restaurant AI Tools
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Grow Your Restaurant with AI
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Generate marketing content, parse menus automatically, and unlock AI-powered tools to scale your restaurant business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-md">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <plan.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-3">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature.label} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? "text-foreground" : "text-muted-foreground/60"
                        }`}
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.variant}
                  className="w-full"
                  size="lg"
                  onClick={() => handleSelectPlan(plan.name)}
                  disabled={plan.name === "Free"}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            All plans include a 7-day free trial. Cancel anytime. Payments powered by Stripe.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
