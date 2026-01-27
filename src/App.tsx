import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
