
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DriverStatusData {
  todayTrips: number;
  todayEarnings: number;
  weeklyPoints: number;
  leaderboardRank: undefined;
  lastTripSummary: undefined;
}

export const useDriverStatus = () => {
  const [statusData, setStatusData] = useState<DriverStatusData>({
    todayTrips: 0,
    todayEarnings: 0,
    weeklyPoints: 0,
    leaderboardRank: undefined,
    lastTripSummary: undefined,
  });

  const loadStatusData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's trips count
      const { data: todayTrips } = await supabase
        .from('trips')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'driver')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      // Get current week's points
      const currentWeek = new Date();
      const monday = new Date(currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1));
      monday.setHours(0, 0, 0, 0);

      const { data: weeklyRewards } = await supabase
        .from('user_rewards')
        .select('points')
        .eq('user_id', user.id)
        .eq('week', monday.toISOString().split('T')[0])
        .single();

      setStatusData({
        todayTrips: todayTrips?.length || 0,
        todayEarnings: 0, // This would need actual earnings calculation
        weeklyPoints: weeklyRewards?.points || 0,
        leaderboardRank: undefined,
        lastTripSummary: undefined,
      });
    } catch (error) {
      console.error('Error loading driver status:', error);
    }
  };

  const toggleOnlineStatus = async (newStatus: boolean, driverProfile: any): Promise<boolean> => {
    if (!driverProfile) return false;

    try {
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_online: newStatus })
        .eq('user_id', driverProfile.user_id);

      if (error) throw error;

      toast({
        title: newStatus ? "You're now online" : "You're now offline",
        description: newStatus 
          ? "You'll receive ride requests from passengers" 
          : "You won't receive any ride requests",
      });

      return true;
    } catch (error) {
      console.error('Error updating online status:', error);
      toast({
        title: "Error",
        description: "Failed to update your status. Please try again.",
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
    toggleOnlineStatus,
    loadStatusData
  };
};
