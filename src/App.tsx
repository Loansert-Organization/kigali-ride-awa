import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RoleSelectPage } from "@/pages/onboarding/RoleSelect";
import { Loader2 } from "lucide-react";
import "./App.css";
import PassengerHomePage from "@/pages/passenger/Home";
import DriverHomePage from "@/pages/driver/Home";
import WelcomePage from "@/pages/Welcome";
import CreateRequest from "@/pages/passenger/CreateRequest";
import MatchesPage from "@/pages/passenger/Matches";
import BookingConfirmedPage from "@/pages/passenger/BookingConfirmed";
import TripHistory from "@/pages/passenger/TripHistory";
import TripDetails from "@/pages/passenger/TripDetails";
import CreateTripPage from "@/pages/driver/CreateTrip";
import VehicleSetupPage from "@/pages/driver/VehicleSetup";
import MapTestPage from "@/pages/diag/MapTest";
import { TripNew } from "@/pages/TripNew";
import { ChatDrawer } from './features/ai-chat/ChatDrawer';
import { DraftTripBanner } from './features/ai-chat/DraftTripBanner';
import { BottomNav } from '@/components/ui/bottom-nav';
import { EmergencyNav } from '@/components/ui/emergency-nav';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useEffect } from 'react';
import { usePushRegistration } from '@/hooks/usePushRegistration';

const AppLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
  </div>
);

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoader />;
  }

  // Allow free access to all routes without authentication barriers
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/role-select" element={<RoleSelectPage />} />
      <Route path="/trip/new" element={<TripNew />} />
      <Route path="/passenger/home" element={<PassengerHomePage />} />
      <Route path="/passenger/request" element={<CreateRequest />} />
      <Route path="/passenger/matches" element={<MatchesPage />} />
      <Route path="/passenger/booking-confirmed/:bookingId" element={<BookingConfirmedPage />} />
      <Route path="/passenger/history" element={<TripHistory />} />
      <Route path="/passenger/trip-details/:tripId" element={<TripDetails />} />
      <Route path="/driver/home" element={<DriverHomePage />} />
      <Route path="/driver/create-trip" element={<CreateTripPage />} />
      <Route path="/driver/vehicle-setup" element={<VehicleSetupPage />} />
      <Route path="/diag/map-test" element={<MapTestPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

// Helper component so hooks run inside AuthProvider context
const PushInit = () => {
  const { register } = usePushRegistration();
  useEffect(() => {
    register();
  }, [register]);
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PushInit />
          <ToastProvider>
            <Router>
              <div className="font-sans pb-16">
                {/* Theme toggle floating button */}
                <div className="fixed top-4 right-4 z-50">
                  <ThemeToggle />
                </div>
                <AppRoutes />
                <Toaster />
                <DraftTripBanner />
                <BottomNav />
                <EmergencyNav />
              </div>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
