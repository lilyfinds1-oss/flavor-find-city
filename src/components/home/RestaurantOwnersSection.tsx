import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Megaphone, ArrowRight, Sparkles, CreditCard, TrendingUp } from "lucide-react";

export function RestaurantOwnersSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <Badge variant="secondary" className="text-sm font-medium">
              For Restaurant Owners
            </Badge>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Grow Your Restaurant with{" "}
            <span className="gradient-text">AI-Powered Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Claim your restaurant listing and unlock premium AI tools to boost your marketing, 
            analyze menus, and attract more customers effortlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {/* AI Marketing Assistant */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">AI Marketing Assistant</CardTitle>
              <CardDescription>
                Generate compelling social media content, Instagram posts, and targeted ads in seconds
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Instagram & Facebook posts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Promotional campaigns
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Branded content creation
                </li>
              </ul>
              <Badge variant="outline" className="text-xs">Available on all plans</Badge>
            </CardContent>
          </Card>

          {/* AI Menu Intelligence */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-accent" />
                </div>
                <Badge variant="secondary" className="text-xs font-medium">Growth Plan</Badge>
              </div>
              <CardTitle className="text-xl">AI Menu Intelligence</CardTitle>
              <CardDescription>
                Upload menu photos and automatically extract dishes, prices, and categories with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Smart menu parsing
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Automatic categorization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Price extraction
                </li>
              </ul>
              <Badge variant="outline" className="text-xs">Advanced AI feature</Badge>
            </CardContent>
          </Card>

          {/* Restaurant Analytics */}
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 md:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Performance Analytics</CardTitle>
              <CardDescription>
                Track reviews, ratings, and customer engagement to grow your business
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <ul className="text-sm text-muted-foreground space-y-2 mb-4">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Review insights
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Customer feedback analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  Trend monitoring
                </li>
              </ul>
              <Badge variant="outline" className="text-xs">Coming soon</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link to="/pricing">
              <Button size="lg" className="gap-2 font-semibold">
                <CreditCard className="w-5 h-5" />
                View Pricing Plans
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/ai-tools">
              <Button variant="outline" size="lg" className="gap-2">
                <Sparkles className="w-5 h-5" />
                Explore AI Tools
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Start with our free plan or upgrade for advanced AI features
          </p>
        </div>
      </div>
    </section>
  );
}