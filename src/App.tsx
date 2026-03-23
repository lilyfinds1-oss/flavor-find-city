import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AnimatePresence } from "framer-motion";
import { CityProvider, useCity } from "@/contexts/CityContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Explore from "./pages/Explore";
import Top100 from "./pages/Top100";
import RestaurantDetail from "./pages/RestaurantDetail";
import Deals from "./pages/Deals";
import Leaderboard from "./pages/Leaderboard";
import Assistant from "./pages/Assistant";
import MapPage from "./pages/Map";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import TopPosts from "./pages/TopPosts";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Install from "./pages/Install";
import Pricing from "./pages/Pricing";
import RestaurantSubscribe from "./pages/RestaurantSubscribe";
import RestaurantBilling from "./pages/RestaurantBilling";
import AIToolsDashboard from "./pages/AIToolsDashboard";
import MenuAnalyzer from "./pages/MenuAnalyzer";
import MarketingAssistant from "./pages/MarketingAssistant";
import ResetPassword from "./pages/ResetPassword";
import SelectCity from "./pages/SelectCity";
import Community from "./pages/Community";
import CommunityCreatePost from "./pages/CommunityCreatePost";
import CommunityPostDetail from "./pages/CommunityPostDetail";
import CuratedList from "./pages/CuratedList";
import About from "./pages/About";
import ForRestaurants from "./pages/ForRestaurants";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { PWAInstallPopup } from "@/components/pwa/PWAInstallPopup";

const queryClient = new QueryClient();

function CityGate({ children }: { children: React.ReactNode }) {
  const { hasCitySelected, isLoading } = useCity();
  const location = useLocation();

  // Allow certain routes without city selection
  const bypassRoutes = ["/select-city", "/auth", "/reset-password", "/admin"];
  if (bypassRoutes.some((r) => location.pathname.startsWith(r))) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!hasCitySelected) {
    return <Navigate to="/select-city" replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <CityGate>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/select-city" element={<SelectCity />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/top-100" element={<Top100 />} />
          <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/top-posts" element={<TopPosts />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/install" element={<Install />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/restaurant-subscribe" element={<RestaurantSubscribe />} />
          <Route path="/billing" element={<RestaurantBilling />} />
          <Route path="/ai-tools" element={<AIToolsDashboard />} />
          <Route path="/menu-analyzer" element={<MenuAnalyzer />} />
          <Route path="/marketing-assistant" element={<MarketingAssistant />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/create" element={<CommunityCreatePost />} />
          <Route path="/community/post/:id" element={<CommunityPostDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </CityGate>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CityProvider>
            <AnimatedRoutes />
            <PWAInstallPopup />
          </CityProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
