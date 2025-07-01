
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
  const { user, role, loading } = useCurrentUser();
  const { setRole } = useAuth();
  const { toast } = useToast();
  
  console.log('WelcomePage render - user:', user, 'role:', role, 'loading:', loading);
  
  // Initialize all hooks at the top level - before any conditional returns
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
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    // Skip anonymous sign-in since it's disabled on this Supabase instance
    // The AuthContext will automatically create a local session
    console.log('Welcome page mounted - local session will be created by AuthContext');
  }, []);

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
      const targetPath = role === UserRole.DRIVER ? '/driver/vehicle-setup' : '/passenger/home';
      navigate(targetPath, { replace: true });
      setRedirected(true);
    }
  }, [role, showCountrySelection, showRoleSelection, redirected, navigate]);

  useEffect(() => {
    setShowLocationPrompt(!locationGranted);
  }, [locationGranted]);

  // Define all handler functions
  const handleCountrySelect = async (country: CountryInfo) => {
    if (!user) return;

    try {
      // For local sessions, just save to localStorage
      if (user.id.startsWith('local-')) {
        localStorage.setItem('userCountry', country.code);
        (user as any).country = country.code;
        
        // Update local session
        const localSession = localStorage.getItem('localSession');
        if (localSession) {
          const session = JSON.parse(localSession);
          session.user.country = country.code;
          localStorage.setItem('localSession', JSON.stringify(session));
        }
        
        setShowCountrySelection(false);
        
        toast({
          title: "Country Set!",
          description: `Welcome to ${country.name}! Pricing and features are now localized for you.`,
        });
        return;
      }

      // For real Supabase users, try to update in database
      const { error } = await supabase
        .from('users')
        .update({ country: country.code })
        .eq('auth_user_id', user.id);

      if (error) {
        console.error('Error updating country:', error);
        // Still save locally as fallback
        localStorage.setItem('userCountry', country.code);
        (user as any).country = country.code;
      } else {
        // Also save locally for quick access
        localStorage.setItem('userCountry', country.code);
        (user as any).country = country.code;
      }
      
      setShowCountrySelection(false);
      
      toast({
        title: "Country Set!",
        description: `Welcome to ${country.name}! Pricing and features are now localized for you.`,
      });
    } catch (error) {
      console.error('Error updating country:', error);
      
      // Fallback to localStorage
      localStorage.setItem('userCountry', country.code);
      (user as any).country = country.code;
      setShowCountrySelection(false);
      
      toast({
        title: "Country Set!",
        description: `Welcome to ${country.name}!`,
      });
    }
  };

  const handleRoleSave = async (roleString: 'driver' | 'passenger') => {
    console.log('handleRoleSave called with:', roleString);
    console.log('Current user:', user);
    
    if (!user) {
      console.error('No user found');
      toast({ 
        title: 'Error', 
        description: 'User session not found. Please refresh the page.', 
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSavingRole(true);
      
      // Convert string to UserRole enum
      const userRole = roleString === 'driver' ? UserRole.DRIVER : UserRole.PASSENGER;
      
      // Use AuthContext's setRole method for proper state management
      await setRole(userRole);
      
      setShowRoleSelection(false);
      
      // Navigate immediately after setting role
      const targetPath = userRole === UserRole.DRIVER ? '/driver/home' : '/passenger/home';
      navigate(targetPath, { replace: true });
      
    } catch (e) {
      console.error('Error saving role:', e);
      toast({ title: 'Error', description: 'Failed to save role', variant: 'destructive'});
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleRequestLocation = async () => {
    try {
      const granted = await requestLocation();
      // Always hide the prompt after attempting, regardless of result
      setShowLocationPrompt(false);
      
      if (!granted) {
        toast({
          title: "No worries!",
          description: "You can still use the app. Just enter locations manually when needed.",
        });
      }
    } catch (error) {
      console.error('Location request error:', error);
      // Even on error, let user continue
      setShowLocationPrompt(false);
    }
  };

  const handleRequestNotification = async () => {
    try {
      await requestNotification();
    } catch (error) {
      console.error('Notification request error:', error);
    }
  };

  const handleSkipPermissions = () => {
    setShowLocationPrompt(false);
    toast({
      title: "Permissions Skipped",
      description: "You can always enable them later in your device settings.",
    });
  };

  // Now we can have conditional returns - after all hooks
  
  // If auth is still loading, show a loader
  if (loading || isSigningIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Overlay chain: Location -> Country -> Role
  if (showLocationPrompt) {
    return (
      <PermissionsStep
        selectedRole={role === 'admin' ? null : role}
        onRequestLocation={handleRequestLocation}
        onSkipLocation={handleSkipPermissions}
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
            <Button onClick={handleRequestLocation} className="w-full max-w-xs">
              Allow Location (Recommended)
            </Button>
            <p className="text-xs text-gray-500">For better ride matching</p>
          </div>
        )}

        {!notificationGranted && (
          <div className="text-center space-y-2">
            <Button onClick={handleRequestNotification} variant="outline" className="w-full max-w-xs">
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
        
        {/* Continue button - always show if we're on this screen */}
        <div className="text-center pt-4">
          <Button 
            onClick={() => {
              if (!role) {
                setShowRoleSelection(true);
              } else {
                const targetPath = role === UserRole.DRIVER ? '/driver/vehicle-setup' : '/passenger/home';
                navigate(targetPath, { replace: true });
              }
            }}
            className="w-full max-w-xs"
            variant="default"
          >
            Continue to App →
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            {!locationGranted && !notificationGranted ? 'Skip permissions and continue' : 'Get started'}
          </p>
        </div>
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
