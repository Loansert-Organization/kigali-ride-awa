
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Bell } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MapBlock from "@/components/passenger/MapBlock";
import SmartSuggestionsBlock from "@/components/passenger/SmartSuggestionsBlock";
import QuickActionsBlock from "@/components/passenger/QuickActionsBlock";
import ReferralBannerBlock from "@/components/passenger/ReferralBannerBlock";
import BottomNavigation from "@/components/navigation/BottomNavigation";

const PassengerHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [openDriverTrips, setOpenDriverTrips] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    loadUserData();
    loadFavorites();
    loadNearbyDrivers();
    loadOpenDriverTrips();
    getCurrentLocation();
    
    // Set up real-time refresh
    const interval = setInterval(() => {
      loadNearbyDrivers();
      loadOpenDriverTrips();
    }, 45000); // Refresh every 45 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { data } = await supabase
            .from('favorites')
            .select('*')
            .eq('user_id', userRecord.id)
            .limit(4);
          
          setFavorites(data || []);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadNearbyDrivers = async () => {
    try {
      const { data } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('is_online', true)
        .limit(10);
      
      // Mock nearby driver locations for demo
      const driversWithLocation = (data || []).map((driver, index) => ({
        ...driver,
        lat: -1.9441 + (Math.random() - 0.5) * 0.02, // Around Kigali
        lng: 30.0619 + (Math.random() - 0.5) * 0.02
      }));
      
      setNearbyDrivers(driversWithLocation);
    } catch (error) {
      console.error('Error loading nearby drivers:', error);
    }
  };

  const loadOpenDriverTrips = async () => {
    try {
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('role', 'driver')
        .eq('status', 'pending')
        .gte('scheduled_time', new Date().toISOString())
        .order('scheduled_time', { ascending: true })
        .limit(8);
      
      setOpenDriverTrips(data || []);
    } catch (error) {
      console.error('Error loading open driver trips:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Fallback to Kigali city center
          setCurrentLocation({
            lat: -1.9441,
            lng: 30.0619
          });
        }
      );
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    switch (suggestion.type) {
      case 'favorite':
        navigate('/book-ride', { state: { destination: suggestion.data } });
        break;
      case 'home':
      case 'market':
      case 'church':
        navigate('/book-ride', { state: { destinationType: suggestion.type } });
        break;
      case 'last_trip':
        // TODO: Get last trip and navigate with it
        navigate('/book-ride');
        break;
      case 'add_favorite':
        navigate('/favorites');
        break;
      default:
        navigate('/book-ride');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'request_ride':
        navigate('/book-ride');
        break;
      case 'view_trips':
        navigate('/matches');
        break;
      case 'my_rides':
        navigate('/past-trips');
        break;
    }
  };

  const handleViewRewards = () => {
    navigate('/rewards');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Muraho! 👋</h1>
            <p className="text-purple-100">Ready for your next ride?</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={() => navigate('/profile')}
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pb-20">
        {/* Map Block */}
        <MapBlock 
          currentLocation={currentLocation}
          nearbyDrivers={nearbyDrivers}
          openDriverTrips={openDriverTrips}
        />
        
        {/* Smart Suggestions */}
        <SmartSuggestionsBlock 
          favorites={favorites}
          onSuggestionClick={handleSuggestionClick}
        />
        
        {/* Quick Actions */}
        <QuickActionsBlock 
          onActionClick={handleQuickAction}
        />
        
        {/* Referral Banner */}
        {user?.promo_code && (
          <ReferralBannerBlock 
            promoCode={user.promo_code}
            onViewRewards={handleViewRewards}
          />
        )}

        {/* Status Banner */}
        {nearbyDrivers.length === 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-orange-700 font-medium">No drivers nearby right now</p>
            <p className="text-orange-600 text-sm mt-1">Try scheduling a ride or check back soon!</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100"
              onClick={() => navigate('/book-ride')}
            >
              Schedule a Ride →
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation role="passenger" />
    </div>
  );
};

export default PassengerHome;
