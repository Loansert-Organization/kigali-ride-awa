
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { 
  useAdminDashboardStats, 
  useWeeklyRewardsLeaderboard, 
  useDailyActivitySnapshot 
} from './useAnalyticsViews';

export interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    totalTrips: number;
    totalBookings: number;
    totalReferrals: number;
    weeklyActiveUsers: number;
    totalRewards: number;
    weeklyTrips: number;
    weeklyBookings: number;
    onlineDrivers: number;
  };
  users: any[];
  trips: any[];
  aiLogs: any[];
  leaderboard: any[];
  dailyActivity: any[];
}

export const useAdminDashboard = (refreshTrigger: number) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { data: statsData, isLoading: statsLoading } = useAdminDashboardStats();
  const { data: leaderboardData, isLoading: leaderboardLoading } = useWeeklyRewardsLeaderboard();
  const { data: dailyActivityData, isLoading: activityLoading } = useDailyActivitySnapshot();

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user data
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Load trip data with user info
      const { data: trips } = await supabase
        .from('trips')
        .select(`
          *, 
          users!inner(promo_code)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load recent agent logs
      const { data: aiLogs } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Combine analytics data with fallbacks
      const kpis = statsData ? {
        totalUsers: statsData.total_users || 0,
        totalTrips: statsData.total_trips || 0,
        totalBookings: statsData.total_bookings || 0,
        totalReferrals: statsData.total_referrals || 0,
        weeklyActiveUsers: statsData.weekly_new_users || 0,
        totalRewards: statsData.total_rewards_issued || 0,
        weeklyTrips: statsData.weekly_trips || 0,
        weeklyBookings: statsData.weekly_bookings || 0,
        onlineDrivers: statsData.online_drivers || 0
      } : {
        totalUsers: 0,
        totalTrips: 0,
        totalBookings: 0,
        totalReferrals: 0,
        weeklyActiveUsers: 0,
        totalRewards: 0,
        weeklyTrips: 0,
        weeklyBookings: 0,
        onlineDrivers: 0
      };

      setData({
        kpis,
        users: users || [],
        trips: trips || [],
        aiLogs: aiLogs || [],
        leaderboard: leaderboardData || [],
        dailyActivity: dailyActivityData || []
      });

    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const allLoading = statsLoading || leaderboardLoading || activityLoading || isLoading;

  return { 
    data, 
    isLoading: allLoading, 
    error, 
    refetch: loadDashboardData 
  };
};
