import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEntryPermissions } from '@/hooks/useEntryPermissions';
import { Car, User, ArrowRight, Plus } from 'lucide-react';
import { CountryStep } from '@/components/onboarding/CountryStep';
import { RewardsCard } from '@/components/gamification/RewardsCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { countryDetectionService, CountryInfo } from '@/services/CountryDetectionService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useCurrentUser();
  const { toast } = useToast();
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  const {
    locationGranted,
    notificationGranted,
    requestLocation,
    requestNotification,
  } = useEntryPermissions();

  // Check if user needs country selection
  useEffect(() => {
    if (user && !user.country) {
      setShowCountrySelection(true);
    }
  }, [user]);

  const handleCountrySelect = async (country: CountryInfo) => {
    if (!user) return;

    try {
      // Update user's country in database
      const { error } = await supabase
        .from('users')
        .update({ country: country.code })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh user data
      await refreshUser();
      
      setShowCountrySelection(false);
      
      toast({
        title: "Country Set!",
        description: `Welcome to ${country.name}! Pricing and features are now localized for you.`,
      });
    } catch (error) {
      console.error('Error updating country:', error);
      toast({
        title: "Error",
        description: "Failed to save your country. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Show country selection if needed
  if (showCountrySelection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <CountryStep 
          onCountrySelect={handleCountrySelect}
          onSkip={() => setShowCountrySelection(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-gradient-to-br from-purple-50 to-blue-50 relative">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-center">
          Welcome to Kigali Ride
          {user?.country && (
            <span className="ml-2">
              {countryDetectionService.getCountryByCode(user.country)?.flag}
            </span>
          )}
        </h1>
        <p className="text-gray-700 text-center max-w-md">
          Connect drivers and passengers across Sub-Saharan Africa. Get started right away!
        </p>
      </div>

      {/* Permissions Section */}
      <div className="w-full max-w-md space-y-3">
        {!locationGranted && (
          <div className="text-center space-y-2">
            <Button onClick={requestLocation} className="w-full max-w-xs">
              Allow Location (Recommended)
            </Button>
            <p className="text-xs text-gray-500">For better ride matching</p>
          </div>
        )}

        {!notificationGranted && (
          <div className="text-center space-y-2">
            <Button onClick={requestNotification} variant="outline" className="w-full max-w-xs">
              Enable Notifications (Optional)
            </Button>
            <p className="text-xs text-gray-500">Get notified about ride matches</p>
          </div>
        )}

        {(locationGranted || notificationGranted) && (
          <p className="text-sm text-gray-500 text-center">
            ✅ Permissions granted: {locationGranted ? '📍 Location ' : ''}
            {notificationGranted ? '🔔 Notifications' : ''}
          </p>
        )}
      </div>

      {/* Rewards Card (if user exists and has country) */}
      {user && user.country && (
        <div className="w-full max-w-md">
          <RewardsCard />
        </div>
      )}

      {/* Quick Start Actions */}
      <div className="w-full max-w-md space-y-3 pt-4">
        <h3 className="text-lg font-semibold text-center">Quick Start</h3>
        
        <Button 
          onClick={() => navigate('/passenger/request')} 
          className="w-full h-14 bg-blue-600 hover:bg-blue-700"
        >
          <User className="w-6 h-6 mr-3" /> 
          Book a Ride
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>
        
        <Button 
          onClick={() => navigate('/driver/create-trip')} 
          className="w-full h-14 bg-green-600 hover:bg-green-700"
        >
          <Car className="w-6 h-6 mr-3" /> 
          Offer a Ride
          <ArrowRight className="w-4 h-4 ml-auto" />
        </Button>

        <div className="text-center pt-2">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/role-select')} 
            className="text-sm text-gray-500"
          >
            Or choose your role first
          </Button>
        </div>

        {/* Country Selection Option */}
        {user && user.country && (
          <div className="text-center pt-2">
            <Button 
              variant="ghost" 
              onClick={() => setShowCountrySelection(true)} 
              className="text-xs text-gray-400"
            >
              Change Country: {countryDetectionService.getCountryByCode(user.country)?.name}
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button for Trip Wizard */}
      <Button
        onClick={() => navigate('/trip/new')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-[#3D7DFF] to-[#8E42FF] hover:from-[#2D6DFF] hover:to-[#7E32FF] z-50"
        size="icon"
        title="Create Trip with Wizard"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default WelcomePage; 