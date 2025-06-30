import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEntryPermissions } from '@/hooks/useEntryPermissions';
import { Bot } from 'lucide-react';
import { CountryStep } from '@/components/onboarding/CountryStep';
import { RewardsCard } from '@/components/gamification/RewardsCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { countryDetectionService, CountryInfo } from '@/services/CountryDetectionService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTripHistory } from '@/hooks/useTripHistory';
import { useActiveRequest } from '@/hooks/useActiveRequest';
import { ChatDrawer } from '@/features/ai-chat/ChatDrawer';
import RoleStep from '@/components/welcome/RoleStep';
import PermissionsStep from '@/components/welcome/PermissionsStep';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, role } = useCurrentUser();
  const { setRole } = useAuth();
  const { toast } = useToast();
  // initialise hooks for side-effects; values are not needed here
  useTripHistory();
  useActiveRequest();
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  const {
    locationGranted,
    notificationGranted,
    requestLocation,
    requestNotification,
  } = useEntryPermissions();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(() => !role);
  const [redirected, setRedirected] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(() => !locationGranted);
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Check if user needs country selection
  useEffect(() => {
    if (user && !user.country) {
      setShowCountrySelection(true);
    }
  }, [user]);

  useEffect(() => {
    setShowRoleSelection(!role);
  }, [role]);

  useEffect(() => {
    if (role && role !== UserRole.ADMIN && !showCountrySelection && !showRoleSelection && !redirected) {
      const targetPath = role === UserRole.DRIVER ? '/driver/home' : '/passenger/home';
      navigate(targetPath, { replace: true });
      setRedirected(true);
    }
  }, [role, showCountrySelection, showRoleSelection, redirected, navigate]);

  useEffect(() => {
    setShowLocationPrompt(!locationGranted);
  }, [locationGranted]);

  const handleCountrySelect = async (country: CountryInfo) => {
    if (!user) return;

    try {
      // Update user's country in database
      const { error } = await supabase
        .from('users')
        .update({ country: country.code })
        .eq('id', user.id);

      if (error) throw error;
      
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

  const handleRoleSave = async (roleString: 'driver' | 'passenger') => {
    if (!user) {
      return;
    }
    
    try {
      setIsSavingRole(true);
      
      // Convert string to UserRole enum
      const userRole = roleString === 'driver' ? UserRole.DRIVER : UserRole.PASSENGER;
      
      // Use AuthContext's setRole method for proper state management
      await setRole(userRole);
      
      setShowRoleSelection(false);
      
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save role', variant: 'destructive'});
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleRequestLocation = () => {
    requestLocation();
  };

  // Overlay chain: Location -> Country -> Role
  if (showLocationPrompt) {
    return (
      <PermissionsStep
        selectedRole={role === 'admin' ? null : role}
        onRequestLocation={handleRequestLocation}
        onSkipLocation={() => setShowLocationPrompt(false)}
        showPWAPrompt={false}
        setShowPWAPrompt={() => {}}
      />
    );
  } else if (showCountrySelection) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <CountryStep 
          onCountrySelect={handleCountrySelect}
          onSkip={() => setShowCountrySelection(false)}
        />
      </div>
    );
  } else if (showRoleSelection) {
    return (
      <RoleStep
        onRoleSelect={handleRoleSave}
        currentLang={{ greeting: 'Welcome!' }}
        isProcessing={isSavingRole}
        selectedRole={null}
        urlPromo={null}
        showPromoInput={false}
        setShowPromoInput={() => {}}
        promoCode=""
        setPromoCode={() => {}}
      />
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

      {/* Country Change link (only) */}
      {!showRoleSelection && user && user.country && (
        <div className="pt-4">
          <Button
            variant="ghost"
            onClick={() => setShowCountrySelection(true)}
            className="text-xs text-gray-400"
          >
            Change Country: {countryDetectionService.getCountryByCode(user.country)?.name}
          </Button>
        </div>
      )}

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsChatOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>

      {/* AI Chat Drawer */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default WelcomePage; 