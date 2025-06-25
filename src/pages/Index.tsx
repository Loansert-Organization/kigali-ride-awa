
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageSelector } from "@/components/landing/LanguageSelector";
import { RoleSelector } from "@/components/landing/RoleSelector";
import { LocationPermission } from "@/components/landing/LocationPermission";
import { PromoCodeSection } from "@/components/landing/PromoCodeSection";
import { PWAInstallPrompt } from "@/components/landing/PWAInstallPrompt";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    // Only proceed if we have both user and profile loaded
    if (!loading && user && userProfile) {
      console.log('Index: User authenticated with profile:', userProfile);
      
      // If user has completed onboarding, redirect to appropriate home
      if (userProfile.onboarding_completed && userProfile.role) {
        if (userProfile.role === 'passenger') {
          navigate('/home/passenger');
        } else if (userProfile.role === 'driver') {
          navigate('/home/driver');
        }
        return;
      }

      // If user has a role but hasn't completed onboarding, go to appropriate onboarding
      if (userProfile.role && !userProfile.onboarding_completed) {
        if (userProfile.role === 'passenger') {
          navigate('/onboarding/passenger');
        } else if (userProfile.role === 'driver') {
          navigate('/onboarding/driver');
        }
        return;
      }
    }
  }, [user, userProfile, loading, navigate]);

  // Show loading while authentication is in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Setting up your ride experience...</p>
        </div>
      </div>
    );
  }

  // Show main landing page if user is authenticated but hasn't selected a role
  if (user && userProfile && !userProfile.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* App Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🚗 Kigali Ride
            </h1>
            <p className="text-lg text-gray-600">
              Fast, reliable rides across Kigali
            </p>
          </div>

          {/* Language Selection */}
          <div className="mb-8">
            <LanguageSelector />
          </div>

          {/* Role Selection */}
          <div className="mb-8">
            <RoleSelector />
          </div>

          {/* Location Permission */}
          <div className="mb-8">
            <LocationPermission />
          </div>

          {/* Promo Code Section */}
          <div className="mb-8">
            <PromoCodeSection />
          </div>

          {/* PWA Install Prompt */}
          <div className="mb-8">
            <PWAInstallPrompt />
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-12">
            <p>Welcome to Kigali Ride - Your journey starts here!</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - show minimal loading state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
