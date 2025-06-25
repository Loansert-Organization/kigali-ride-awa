
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    totalTrips: number;
    completedBookings: number;
    referralsActivated: number;
    weeklyActiveUsers: number;
    usersDelta?: number;
    tripsDelta?: number;
  };
  users: any[];
  trips: any[];
  aiLogs: any[];
}

export const useAdminDashboard = (refreshTrigger: number) => {
  return useQuery({
    queryKey: ['admin-dashboard', refreshTrigger],
    queryFn: async () => {
      // Fetch KPIs
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, role, created_at, updated_at');

      if (usersError) throw usersError;

      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('id, role, status, created_at, from_location, to_location, scheduled_time, fare, user_id');

      if (tripsError) throw tripsError;

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, confirmed, created_at');

      if (bookingsError) throw bookingsError;

      const { data: referralsData, error: referralsError } = await supabase
        .from('user_referrals')
        .select('id, validation_status, created_at');

      if (referralsError) throw referralsError;

      // Calculate KPIs
      const totalUsers = usersData?.length || 0;
      const totalTrips = tripsData?.length || 0;
      const completedBookings = bookingsData?.filter(b => b.confirmed).length || 0;
      const referralsActivated = referralsData?.filter(r => r.validation_status === 'validated').length || 0;

      // Weekly active users (users who created a trip in the last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyActiveUsers = tripsData?.filter(trip => 
        new Date(trip.created_at) >= weekAgo
      ).length || 0;

      // Process users data for table
      const processedUsers = usersData?.map(user => {
        const userTrips = tripsData?.filter(trip => trip.user_id === user.id) || [];
        
        return {
          id: user.id,
          name: `User ${user.id.slice(0, 8)}`,
          phone: '+250788123456', // Mock phone - in real app would come from profile
          role: user.role || 'passenger',
          dateJoined: user.created_at,
          tripsCount: userTrips.length,
          lastSeen: new Date(user.updated_at) > new Date(Date.now() - 24*60*60*1000) ? 'today' : 
                   new Date(user.updated_at).toLocaleDateString(),
          status: new Date(user.updated_at) > new Date(Date.now() - 7*24*60*60*1000) ? 'active' : 'inactive'
        };
      }) || [];

      // Process trips data for table
      const processedTrips = tripsData?.map(trip => ({
        id: trip.id,
        role: trip.role,
        status: trip.status,
        fromLocation: trip.from_location,
        toLocation: trip.to_location,
        scheduledTime: trip.scheduled_time,
        fare: trip.fare,
        createdBy: `User ${trip.user_id?.slice(0, 8)}`
      })) || [];

      return {
        kpis: {
          totalUsers,
          totalTrips,
          completedBookings,
          referralsActivated,
          weeklyActiveUsers,
          usersDelta: 5, // Mock delta
          tripsDelta: 12  // Mock delta
        },
        users: processedUsers,
        trips: processedTrips,
        aiLogs: [] // Will be populated by AI logs service
      } as AdminDashboardData;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
