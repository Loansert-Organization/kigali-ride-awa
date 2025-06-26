
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import BookRide from "./pages/BookRide";
import PassengerHome from "./pages/home/Passenger";
import DriverHome from "./pages/home/Driver";
import VehicleSetup from "./pages/driver/VehicleSetup";
import CreateTrip from "./pages/driver/CreateTrip";
import RideMatches from "./pages/RideMatches";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import FavoritesManager from "./pages/FavoritesManager";
import PassengerRequests from "./pages/PassengerRequests";

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
            <Route path="/book-ride" element={<BookRide />} />
            <Route path="/home/passenger" element={<PassengerHome />} />
            <Route path="/home/driver" element={<DriverHome />} />
            <Route path="/vehicle-setup" element={<VehicleSetup />} />
            <Route path="/create-trip" element={<CreateTrip />} />
            <Route path="/ride-matches" element={<RideMatches />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<FavoritesManager />} />
            <Route path="/passenger-requests" element={<PassengerRequests />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
