
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    totalTrips: number;
    totalBookings: number;
    totalReferrals: number;
    weeklyActiveUsers: number;
    totalRewards: number;
  };
  users: any[];
  trips: any[];
  aiLogs: any[];
}

export const useAdminDashboard = (refreshTrigger: number) => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [refreshTrigger]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load KPI data - RLS will handle admin access
      const [
        { count: totalUsers },
        { count: totalTrips },
        { count: totalBookings },
        { count: totalReferrals },
        { data: recentUsers },
        { data: trips },
        { data: rewards }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('trips').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('user_referrals').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('trips').select(`
          *, 
          users!inner(
            promo_code
          )
        `).order('created_at', { ascending: false }).limit(50),
        supabase.from('user_rewards').select('points').eq('reward_issued', true)
      ]);

      const totalRewardsIssued = rewards?.reduce((sum, r) => sum + (r.points || 0), 0) || 0;

      const kpis = {
        totalUsers: totalUsers || 0,
        totalTrips: totalTrips || 0,
        totalBookings: totalBookings || 0,
        totalReferrals: totalReferrals || 0,
        weeklyActiveUsers: recentUsers?.length || 0,
        totalRewards: totalRewardsIssued
      };

      // Load user data
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Mock AI logs for now
      const aiLogs = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          agent: 'trip-matcher',
          action: 'match_found',
          details: 'Matched passenger with driver',
          status: 'success'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          agent: 'referral-validator',
          action: 'validate_referral',
          details: 'Processed weekly referral rewards',
          status: 'success'
        }
      ];

      setData({
        kpis,
        users: users || [],
        trips: trips || [],
        aiLogs
      });

    } catch (err) {
      console.error('Error loading admin dashboard:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch: loadDashboardData };
};
