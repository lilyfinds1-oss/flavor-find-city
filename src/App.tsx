import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
