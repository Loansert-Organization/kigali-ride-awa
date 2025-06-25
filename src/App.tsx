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
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import PastTrips from "@/pages/PastTrips";
import DriverHome from "@/pages/driver/DriverHome";
import AdminOverview from "@/pages/admin/Overview";
import AdminUsers from "@/pages/admin/Users";
import AdminTrips from "@/pages/admin/Trips";
import UserDetails from "@/pages/admin/UserDetails";
import DriverDetails from "@/pages/admin/DriverDetails";

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
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/past-trips" element={<PastTrips />} />
                <Route path="/driver" element={<DriverHome />} />
                <Route path="/admin/overview" element={<AdminOverview />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/trips" element={<AdminTrips />} />
                <Route path="/admin/user-details" element={<UserDetails />} />
                <Route path="/admin/driver-details" element={<DriverDetails />} />
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
