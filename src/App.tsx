
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";
import { useState, useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Import all pages
import Index from "@/pages/Index";
import WelcomeLanding from "@/pages/WelcomeLanding";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import PastTrips from "@/pages/PastTrips";
import Rewards from "@/pages/Rewards";
import Favorites from "@/pages/Favorites";
import TripDetails from "@/pages/TripDetails";
import CreateTrip from "@/pages/CreateTrip";
import DriverTrips from "@/pages/DriverTrips";

// Home pages
import PassengerHome from "@/pages/home/Passenger";
import DriverHome from "@/pages/home/Driver";

// Onboarding pages
import PassengerOnboarding from "@/pages/onboarding/Passenger";
import DriverOnboarding from "@/pages/onboarding/Driver";

// Driver pages
import DriverHomePage from "@/pages/driver/DriverHome";

// Admin pages
import AdminOverview from "@/pages/admin/Overview";
import AdminUsers from "@/pages/admin/Users";
import AdminTrips from "@/pages/admin/Trips";
import UserDetails from "@/pages/admin/UserDetails";
import DriverDetails from "@/pages/admin/DriverDetails";
import ProductionReadiness from "@/pages/admin/ProductionReadiness";

// Booking pages
import BookRide from "@/pages/BookRide";
import RideMatches from "@/pages/RideMatches";

const queryClient = new QueryClient();

const App = () => {
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const { isSupported, permissionStatus } = usePushNotifications();

  useEffect(() => {
    // Show notification permission modal after a short delay if not already granted
    const timer = setTimeout(() => {
      if (isSupported && permissionStatus === 'default') {
        setShowNotificationModal(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, permissionStatus]);

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Landing and Auth */}
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<WelcomeLanding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Home Routes */}
                <Route path="/home" element={<Home />} />
                <Route path="/home/passenger" element={<PassengerHome />} />
                <Route path="/home/driver" element={<DriverHome />} />
                
                {/* Onboarding */}
                <Route path="/onboarding/passenger" element={<PassengerOnboarding />} />
                <Route path="/onboarding/driver" element={<DriverOnboarding />} />
                
                {/* Universal Pages */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/past-trips" element={<PastTrips />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/trip-details" element={<TripDetails />} />
                
                {/* Passenger Pages */}
                <Route path="/book-ride" element={<BookRide />} />
                <Route path="/ride-matches" element={<RideMatches />} />
                
                {/* Driver Pages */}
                <Route path="/driver" element={<DriverHomePage />} />
                <Route path="/create-trip" element={<CreateTrip />} />
                <Route path="/driver-trips" element={<DriverTrips />} />
                <Route path="/driver-requests" element={<DriverTrips />} />
                
                {/* Admin Pages */}
                <Route path="/admin/overview" element={<AdminOverview />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/trips" element={<AdminTrips />} />
                <Route path="/admin/user-details" element={<UserDetails />} />
                <Route path="/admin/driver-details" element={<DriverDetails />} />
                <Route path="/admin/production-readiness" element={<ProductionReadiness />} />
              </Routes>
            </BrowserRouter>
            
            <NotificationPermissionModal
              isOpen={showNotificationModal}
              onClose={() => setShowNotificationModal(false)}
            />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
