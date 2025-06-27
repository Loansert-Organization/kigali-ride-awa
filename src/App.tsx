import React, { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalWhatsAppAuthProvider } from "@/contexts/GlobalWhatsAppAuthContext";
import Index from "./pages/Index";
import Home from "./pages/Home";
import PassengerHome from "./pages/home/Passenger";
import DriverHome from "./pages/home/Driver";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import BookRide from "./pages/BookRide";
import RideMatches from "./pages/RideMatches";
import Rewards from "./pages/Rewards";
import Leaderboard from "./pages/Leaderboard";
import CreateTrip from "./pages/CreateTrip";
import TripDetails from "./pages/TripDetails";
import Favorites from "./pages/Favorites";
import FavoritesManager from "./pages/FavoritesManager";
import PastTrips from "./pages/PastTrips";
import DriverTrips from "./pages/DriverTrips";
import DriverEarnings from "./pages/DriverEarnings";
import PassengerRequests from "./pages/PassengerRequests";
import WelcomeLanding from "./pages/WelcomeLanding";
import AIDevTools from "./pages/AIDevTools";

// Lazy load admin pages
const AdminOverview = lazy(() => import('./pages/admin/Overview'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminTrips = lazy(() => import('./pages/admin/Trips'));
const AdminUserDetail = lazy(() => import('./pages/admin/UserDetails'));
const AdminDriverDetail = lazy(() => import('./pages/admin/DriverDetails'));
const AdminTripHeatmap = lazy(() => import('./pages/admin/TripHeatmap'));
const AdminRewards = lazy(() => import('./pages/admin/RewardsManagement'));
const AdminProduction = lazy(() => import('./pages/admin/ProductionReadiness'));

// Home sub-routes
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Loading component for suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

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
                  
                  {/* Admin Routes - Lazy loaded */}
                  <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminOverview /></Suspense>} />
                  <Route path="/admin/overview" element={<Suspense fallback={<PageLoader />}><AdminOverview /></Suspense>} />
                  <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
                  <Route path="/admin/trips" element={<Suspense fallback={<PageLoader />}><AdminTrips /></Suspense>} />
                  <Route path="/admin/user/:id" element={<Suspense fallback={<PageLoader />}><AdminUserDetail /></Suspense>} />
                  <Route path="/admin/driver/:id" element={<Suspense fallback={<PageLoader />}><AdminDriverDetail /></Suspense>} />
                  <Route path="/admin/trip-heatmap" element={<Suspense fallback={<PageLoader />}><AdminTripHeatmap /></Suspense>} />
                  <Route path="/admin/rewards" element={<Suspense fallback={<PageLoader />}><AdminRewards /></Suspense>} />
                  <Route path="/admin/production-readiness" element={<Suspense fallback={<PageLoader />}><AdminProduction /></Suspense>} />
                  
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
