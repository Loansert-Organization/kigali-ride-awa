
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, RefreshCw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import OnlineToggleBlock from "@/components/driver/OnlineToggleBlock";
import DriverStatusSummary from "@/components/driver/DriverStatusSummary";
import QuickActionButtons from "@/components/driver/QuickActionButtons";
import PassengerRequestsFeed from "@/components/driver/PassengerRequestsFeed";

const DriverHome = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{lat: number; lng: number} | null>(null);
  const [statusData, setStatusData] = useState({
    todayTrips: 0,
    todayEarnings: 0,
    weeklyPoints: 0,
    leaderboardRank: undefined,
    lastTripSummary: undefined
  });

  useEffect(() => {
    loadUserData();
    loadDriverProfile();
    loadStatusData();
    getCurrentLocation();
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

  const loadDriverProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          const { data: profile } = await supabase
            .from('driver_profiles')
            .select('*')
            .eq('user_id', userRecord.id)
            .single();
          
          if (profile) {
            setDriverProfile(profile);
            setIsOnline(profile.is_online);
          } else {
            // Redirect to driver setup if no profile exists
            navigate('/onboarding/driver');
          }
        }
      }
    } catch (error) {
      console.error('Error loading driver profile:', error);
    }
  };

  const loadStatusData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();
        
        if (userRecord) {
          // Load today's trip count and earnings
          const today = new Date().toISOString().split('T')[0];
          const { data: todayTrips } = await supabase
            .from('trips')
            .select('fare')
            .eq('user_id', userRecord.id)
            .eq('role', 'driver')
            .eq('status', 'completed')
            .gte('created_at', today + 'T00:00:00')
            .lt('created_at', today + 'T23:59:59');

          const tripCount = todayTrips?.length || 0;
          const earnings = todayTrips?.reduce((sum, trip) => sum + (trip.fare || 0), 0) || 0;

          // Load weekly points (simplified)
          const { data: rewardsData } = await supabase
            .from('user_rewards')
            .select('points')
            .eq('user_id', userRecord.id)
            .single();

          setStatusData({
            todayTrips: tripCount,
            todayEarnings: earnings,
            weeklyPoints: rewardsData?.points || 0,
            leaderboardRank: undefined, // Would need leaderboard calculation
            lastTripSummary: undefined // Would need last trip data
          });
        }
      }
    } catch (error) {
      console.error('Error loading status data:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Use default Kigali coordinates
          setDriverLocation({
            lat: -1.9441,
            lng: 30.0619
          });
        }
      );
    }
  };

  const toggleOnlineStatus = async (newStatus: boolean) => {
    if (!driverProfile) return;

    setIsToggleLoading(true);
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_online: newStatus })
        .eq('user_id', driverProfile.user_id);

      if (error) throw error;

      setIsOnline(newStatus);
      toast({
        title: newStatus ? "You're now online! ✅" : "You're now offline ❌",
        description: newStatus 
          ? "You'll receive ride requests from passengers" 
          : "You won't receive new ride requests",
      });

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsToggleLoading(false);
    }
  };

  const handleQuickStart = async () => {
    if (!driverLocation) {
      toast({
        title: "Location needed",
        description: "Please enable location access to start a trip",
        variant: "destructive"
      });
      return;
    }

    // Navigate to create trip with current location pre-filled
    navigate('/create-trip', {
      state: {
        quickStart: true,
        currentLocation: driverLocation
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🚗 Driver Dashboard</h1>
            <p className="text-blue-100">
              {driverProfile?.vehicle_type} • {driverProfile?.plate_number}
            </p>
          </div>
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

      <div className="p-4 space-y-4 pb-24">
        {/* Online Status Toggle */}
        <OnlineToggleBlock
          isOnline={isOnline}
          onToggle={toggleOnlineStatus}
          isLoading={isToggleLoading}
        />

        {/* Driver Status Summary */}
        <DriverStatusSummary
          todayTrips={statusData.todayTrips}
          todayEarnings={statusData.todayEarnings}
          weeklyPoints={statusData.weeklyPoints}
          leaderboardRank={statusData.leaderboardRank}
          lastTripSummary={statusData.lastTripSummary}
        />

        {/* Quick Action Buttons */}
        <QuickActionButtons
          onQuickStart={handleQuickStart}
          isOnline={isOnline}
        />

        {/* Passenger Requests Feed */}
        <PassengerRequestsFeed
          driverLocation={driverLocation}
          vehicleType={driverProfile?.vehicle_type || 'car'}
          isOnline={isOnline}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation role="driver" />
    </div>
  );
};

export default DriverHome;
