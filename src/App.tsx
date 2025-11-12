import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
          <Route path="/vehicle-type" element={<Index />} />
          <Route path="/driving-licence" element={<Index />} />
          <Route path="/marital-status" element={<Index />} />
          <Route path="/date-of-birth" element={<Index />} />
          <Route path="/address1" element={<Index />} />
          <Route path="/housing-situation1" element={<Index />} />
          <Route path="/address-duration1" element={<Index />} />
          <Route path="/address2" element={<Index />} />
          <Route path="/housing-situation2" element={<Index />} />
          <Route path="/address-duration2" element={<Index />} />
          <Route path="/address3" element={<Index />} />
          <Route path="/housing-situation3" element={<Index />} />
          <Route path="/address-duration3" element={<Index />} />
          <Route path="/address4" element={<Index />} />
          <Route path="/housing-situation4" element={<Index />} />
          <Route path="/address-duration4" element={<Index />} />
          <Route path="/address5" element={<Index />} />
          <Route path="/housing-situation5" element={<Index />} />
          <Route path="/address-duration5" element={<Index />} />
          <Route path="/employment" element={<Index />} />
          <Route path="/job-details" element={<Index />} />
          <Route path="/employment-duration" element={<Index />} />
          <Route path="/monthly-income" element={<Index />} />
          <Route path="/loan-amount" element={<Index />} />
          <Route path="/personal-details" element={<Index />} />
          <Route path="/contact-details" element={<Index />} />
          <Route path="/thankyou" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;