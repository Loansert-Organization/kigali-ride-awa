
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useDriverStatus = () => {
  const [statusData, setStatusData] = useState({
    todayTrips: 0,
    todayEarnings: 0,
    weeklyPoints: 0,
    leaderboardRank: undefined,
    lastTripSummary: undefined
  });

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

  const toggleOnlineStatus = async (newStatus: boolean, driverProfile: any) => {
    if (!driverProfile) return false;

    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_online: newStatus })
        .eq('user_id', driverProfile.user_id);

      if (error) throw error;

      toast({
        title: newStatus ? "You're now online! ✅" : "You're now offline ❌",
        description: newStatus 
          ? "You'll receive ride requests from passengers" 
          : "You won't receive new ride requests",
      });

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      return true;
    } catch (error) {
      console.error('Error updating online status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    loadStatusData();
  }, []);

  return {
    statusData,
    loadStatusData,
    toggleOnlineStatus
  };
};
