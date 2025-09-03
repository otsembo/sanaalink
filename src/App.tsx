import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ProviderRegistration from "./pages/ProviderRegistration";
import ProviderProfile from "./pages/ProviderProfile";
import NotFound from "./pages/NotFound";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProductsGallery from "./pages/ProductsGallery";
import ServicesGallery from "./pages/ServicesGallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/register-provider" element={<ProviderRegistration />} />
            <Route path="/provider">
              <Route path=":id" element={<ProviderProfile />} />
              <Route path="dashboard/*" element={<ProviderDashboard />} />
            </Route>
            <Route path="/marketplace" element={<ProductsGallery />} />
            <Route path="/services" element={<ServicesGallery />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
