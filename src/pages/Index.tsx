
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWhatsAppAuth } from "@/contexts/WhatsAppAuthContext";
import WelcomeLanding from "./WelcomeLanding";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, loading } = useWhatsAppAuth();

  useEffect(() => {
    // Only redirect authenticated users with completed profiles
    if (isAuthenticated && userProfile) {
      console.log('Index: User authenticated with profile:', userProfile);
      
      if (userProfile.onboarding_completed && userProfile.role) {
        if (userProfile.role === 'passenger') {
          navigate('/home/passenger');
        } else if (userProfile.role === 'driver') {
          navigate('/home/driver');
        }
        return;
      }

      if (userProfile.role && !userProfile.onboarding_completed) {
        if (userProfile.role === 'passenger') {
          navigate('/onboarding/passenger');
        } else if (userProfile.role === 'driver') {
          navigate('/onboarding/driver');
        }
        return;
      }
    }
  }, [isAuthenticated, userProfile, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your ride experience...</p>
        </div>
      </div>
    );
  }

  // Show welcome landing for all users (guest mode by default)
  return <WelcomeLanding />;
};

export default Index;
