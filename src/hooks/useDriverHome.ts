
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface DriverHomeData {
  user: any;
  driverProfile: any;
  isOnline: boolean;
  driverLocation: {lat: number; lng: number} | null;
  statusData: {
    todayTrips: number;
    todayEarnings: number;
    weeklyPoints: number;
    leaderboardRank: undefined;
    lastTripSummary: undefined;
  };
}

export const useDriverHome = () => {
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

          const { data: rewardsData } = await supabase
            .from('user_rewards')
            .select('points')
            .eq('user_id', userRecord.id)
            .single();

          setStatusData({
            todayTrips: tripCount,
            todayEarnings: earnings,
            weeklyPoints: rewardsData?.points || 0,
            leaderboardRank: undefined,
            lastTripSummary: undefined
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

    navigate('/create-trip', {
      state: {
        quickStart: true,
        currentLocation: driverLocation
      }
    });
  };

  useEffect(() => {
    loadUserData();
    loadDriverProfile();
    loadStatusData();
    getCurrentLocation();
  }, []);

  return {
    user,
    driverProfile,
    isOnline,
    isToggleLoading,
    driverLocation,
    statusData,
    toggleOnlineStatus,
    handleQuickStart,
    navigate
  };
};
