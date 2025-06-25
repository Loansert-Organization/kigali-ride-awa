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
import DriverTrips from "./pages/DriverTrips";
import TripDetails from "./pages/TripDetails";
import PastTrips from "./pages/PastTrips";
import AIDevTools from "./pages/AIDevTools";
import Favorites from "./pages/Favorites";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import DriverEarnings from "./pages/DriverEarnings";
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminTrips from "./pages/admin/Trips";
import VehicleSetup from "./pages/driver/VehicleSetup";
import PassengerRequests from "./pages/driver/PassengerRequests";
import RewardsManagement from "./pages/admin/RewardsManagement";
import TripHeatmap from "./pages/admin/TripHeatmap";

const queryClient = new QueryClient();

function App() {
  return (
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
              <Route path="/driver-trips" element={<DriverTrips />} />
              <Route path="/driver-earnings" element={<DriverEarnings />} />
              <Route path="/trip-details" element={<TripDetails />} />
              <Route path="/past-trips" element={<PastTrips />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/ai-dev-tools" element={<AIDevTools />} />
              <Route path="/admin/overview" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/trips" element={<AdminTrips />} />
              
              {/* Driver Routes */}
              <Route path="/driver/vehicle-setup" element={<VehicleSetup />} />
              <Route path="/driver/passenger-requests" element={<PassengerRequests />} />
              
              {/* Admin Routes */}
              <Route path="/admin/rewards" element={<RewardsManagement />} />
              <Route path="/admin/heatmap" element={<TripHeatmap />} />
              
              {/* Profile Routes */}
              <Route path="/profile/driver" element={<Profile />} />
              <Route path="/profile/passenger" element={<Profile />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
