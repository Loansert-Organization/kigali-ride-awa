
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export const useAdminDashboardStats = () => {
  return useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_dashboard_stats_view')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useWeeklyRewardsLeaderboard = () => {
  return useQuery({
    queryKey: ['weekly-rewards-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_rewards_leaderboard_view')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useDriverBookingSuccess = () => {
  return useQuery({
    queryKey: ['driver-booking-success'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_booking_success_view')
        .select('*')
        .order('booking_rate_percent', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};

export const useDailyActivitySnapshot = () => {
  return useQuery({
    queryKey: ['daily-activity-snapshot'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_activity_snapshot_view')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });
};
