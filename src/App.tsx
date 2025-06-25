
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DriverOnboarding from "./pages/onboarding/Driver";
import PassengerOnboarding from "./pages/onboarding/Passenger";
import PassengerHome from "./pages/home/Passenger";
import DriverHome from "./pages/home/Driver";
import BookRide from "./pages/BookRide";
import RideMatches from "./pages/RideMatches";
import CreateTrip from "./pages/CreateTrip";
import PastTrips from "./pages/PastTrips";
import AIDevTools from "./pages/AIDevTools";

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
            <Route path="/onboarding/driver" element={<DriverOnboarding />} />
            <Route path="/onboarding/passenger" element={<PassengerOnboarding />} />
            <Route path="/home/passenger" element={<PassengerHome />} />
            <Route path="/home/driver" element={<DriverHome />} />
            <Route path="/book-ride" element={<BookRide />} />
            <Route path="/matches" element={<RideMatches />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/past-trips" element={<PastTrips />} />
            <Route path="/ai-dev-tools" element={<AIDevTools />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
