
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WhatsAppAuthProvider } from "@/contexts/WhatsAppAuthContext";
import Index from "./pages/Index";
import BookRide from "./pages/BookRide";
import PassengerHome from "./pages/PassengerHome";
import DriverHome from "./pages/DriverHome";
import VehicleSetup from "./pages/driver/VehicleSetup";
import PassengerOnboarding from "./pages/onboarding/Passenger";
import DriverOnboarding from "./pages/onboarding/Driver";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WhatsAppAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/book-ride" element={<BookRide />} />
            <Route path="/home/passenger" element={<PassengerHome />} />
            <Route path="/home/driver" element={<DriverHome />} />
            <Route path="/vehicle-setup" element={<VehicleSetup />} />
            <Route path="/onboarding/passenger" element={<PassengerOnboarding />} />
            <Route path="/onboarding/driver" element={<DriverOnboarding />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WhatsAppAuthProvider>
  </QueryClientProvider>
);

export default App;
