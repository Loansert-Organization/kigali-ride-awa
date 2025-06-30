import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEntryPermissions } from '@/hooks/useEntryPermissions';
import { Car, User, ArrowRight, Plus, Bot } from 'lucide-react';
import { CountryStep } from '@/components/onboarding/CountryStep';
import { RewardsCard } from '@/components/gamification/RewardsCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { countryDetectionService, CountryInfo } from '@/services/CountryDetectionService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTripHistory } from '@/hooks/useTripHistory';
import { useActiveRequest } from '@/hooks/useActiveRequest';
import { ChatDrawer } from '@/features/ai-chat/ChatDrawer';
import { RoleStep } from '@/components/welcome/RoleStep';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useCurrentUser();
  const { toast } = useToast();
  const { trips, loading: tripsLoading } = useTripHistory();
  const { activeRequest, loading: requestLoading } = useActiveRequest();
  const [showCountrySelection, setShowCountrySelection] = useState(false);
  const {
    locationGranted,
    notificationGranted,
    requestLocation,
    requestNotification,
  } = useEntryPermissions();
  const [activeTab, setActiveTab] = useState<'driver' | 'passenger'>('passenger');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [redirected, setRedirected] = useState(false);

  // Check if user needs country selection
  useEffect(() => {
    if (user && !user.country) {
      setShowCountrySelection(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && !user.role) {
      setShowRoleSelection(true);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role && !showCountrySelection && !showRoleSelection && !redirected) {
      navigate(user.role === 'driver' ? '/driver/home' : '/passenger/home', { replace: true });
      setRedirected(true);
    }
  }, [user, showCountrySelection, showRoleSelection, redirected, navigate]);

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

  const handleRoleSave = async (role: 'driver' | 'passenger') => {
    if (!user) return;
    await supabase.from('users').update({ role }).eq('id', user.id);
    await refreshUser();
    setShowRoleSelection(false);
    navigate(role === 'driver' ? '/driver/home' : '/passenger/home');
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

  if (showRoleSelection) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <RoleStep onRoleSelect={handleRoleSave} />
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
      {!showRoleSelection && (
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
      )}

      {/* Quick Stats */}
      <div className="container mx-auto px-4 py-8">
        {/* ... existing code ... */}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <Button
          onClick={() => setIsChatOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </Button>
        <Button
          onClick={() => navigate('/trip/new')}
          size="icon"
          className="h-16 w-16 rounded-full shadow-lg"
          aria-label="Create new trip"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </div>

      {/* AI Chat Drawer */}
      <ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default WelcomePage; 