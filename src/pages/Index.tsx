
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WelcomeLanding from "./WelcomeLanding";
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

  // Show unified landing experience for users who need role selection
  if (user && userProfile && !userProfile.role) {
    return <WelcomeLanding />;
  }

  // Show unified landing for unauthenticated users
  if (!user) {
    return <WelcomeLanding />;
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
