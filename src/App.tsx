
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalWhatsAppAuthProvider } from "@/contexts/GlobalWhatsAppAuthContext";
import Index from "./pages/Index";
import BookRide from "./pages/BookRide";
import RideMatches from "./pages/RideMatches";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateTrip from "./pages/CreateTrip";
import NotFound from "./pages/NotFound";
import TripDetails from "./pages/TripDetails";
import Favorites from "./pages/Favorites";
import FavoritesManager from "./pages/FavoritesManager";
import PastTrips from "./pages/PastTrips";
import DriverTrips from "./pages/DriverTrips";
import DriverEarnings from "./pages/DriverEarnings";
import PassengerRequests from "./pages/PassengerRequests";
import WelcomeLanding from "./pages/WelcomeLanding";
import AIDevTools from "./pages/AIDevTools";

// Admin routes
import AdminOverview from "./pages/admin/Overview";
import AdminUsers from "./pages/admin/Users";
import AdminTrips from "./pages/admin/Trips";
import AdminUserDetails from "./pages/admin/UserDetails";
import AdminDriverDetails from "./pages/admin/DriverDetails";
import AdminTripHeatmap from "./pages/admin/TripHeatmap";
import AdminRewardsManagement from "./pages/admin/RewardsManagement";
import AdminProductionReadiness from "./pages/admin/ProductionReadiness";

// Home sub-routes
import PassengerHome from "./pages/home/Passenger";
import DriverHome from "./pages/home/Driver";

// Profile sub-routes
import PassengerProfile from "./pages/profile/Passenger";
import DriverProfile from "./pages/profile/Driver";

// Driver sub-routes
import DriverCreateTrip from "./pages/driver/CreateTrip";
import DriverPassengerRequests from "./pages/driver/PassengerRequests";
import VehicleSetup from "./pages/driver/VehicleSetup";

// Onboarding routes
import PassengerOnboarding from "./pages/onboarding/Passenger";
import DriverOnboarding from "./pages/onboarding/Driver";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalWhatsAppAuthProvider>
          <ToastProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/welcome" element={<WelcomeLanding />} />
                  <Route path="/onboarding/passenger" element={<PassengerOnboarding />} />
                  <Route path="/onboarding/driver" element={<DriverOnboarding />} />
                  <Route path="/book-ride" element={<BookRide />} />
                  <Route path="/ride-matches" element={<RideMatches />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/passenger" element={<PassengerProfile />} />
                  <Route path="/profile/driver" element={<DriverProfile />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/home/passenger" element={<PassengerHome />} />
                  <Route path="/home/driver" element={<DriverHome />} />
                  <Route path="/create-trip" element={<CreateTrip />} />
                  <Route path="/driver/create-trip" element={<DriverCreateTrip />} />
                  <Route path="/driver/passenger-requests" element={<DriverPassengerRequests />} />
                  <Route path="/vehicle-setup" element={<VehicleSetup />} />
                  <Route path="/trip/:id" element={<TripDetails />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/favorites-manager" element={<FavoritesManager />} />
                  <Route path="/past-trips" element={<PastTrips />} />
                  <Route path="/driver-trips" element={<DriverTrips />} />
                  <Route path="/driver-earnings" element={<DriverEarnings />} />
                  <Route path="/passenger-requests" element={<PassengerRequests />} />
                  <Route path="/ai-dev-tools" element={<AIDevTools />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminOverview />} />
                  <Route path="/admin/overview" element={<AdminOverview />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/trips" element={<AdminTrips />} />
                  <Route path="/admin/user/:id" element={<AdminUserDetails />} />
                  <Route path="/admin/driver/:id" element={<AdminDriverDetails />} />
                  <Route path="/admin/trip-heatmap" element={<AdminTripHeatmap />} />
                  <Route path="/admin/rewards" element={<AdminRewardsManagement />} />
                  <Route path="/admin/production-readiness" element={<AdminProductionReadiness />} />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </Router>
            <Toaster />
          </ToastProvider>
        </GlobalWhatsAppAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
