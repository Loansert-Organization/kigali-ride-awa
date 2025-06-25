
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface AdminUsersParams {
  refreshTrigger: number;
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
}

export const useAdminUsers = ({ refreshTrigger, searchQuery, roleFilter, statusFilter }: AdminUsersParams) => {
  return useQuery({
    queryKey: ['admin-users', refreshTrigger, searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      // Fetch users with optional filtering
      let query = supabase
        .from('users')
        .select('id, role, created_at, updated_at, promo_code');

      // Apply role filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data: usersData, error: usersError } = await query;
      if (usersError) throw usersError;

      // Fetch trips data to calculate trip counts
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('id, user_id, created_at');

      if (tripsError) throw tripsError;

      // Process users data
      const processedUsers = usersData?.map(user => {
        const userTrips = tripsData?.filter(trip => trip.user_id === user.id) || [];
        
        // Mock status - in real implementation this would come from a user_status table
        const status = Math.random() > 0.9 ? 'flagged' : Math.random() > 0.95 ? 'banned' : 'active';
        
        const processedUser = {
          id: user.id,
          name: `User ${user.id.slice(0, 8)}`, // Mock name - in real app would come from profile
          phone: '+250788123456', // Mock phone - in real app would come from profile
          role: user.role || 'passenger',
          tripsCount: userTrips.length,
          lastSeen: new Date(user.updated_at) > new Date(Date.now() - 24*60*60*1000) ? 'today' : 
                   new Date(user.updated_at).toLocaleDateString(),
          status,
          dateJoined: user.created_at
        };

        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            processedUser.name.toLowerCase().includes(searchLower) ||
            processedUser.phone.includes(searchQuery) ||
            (user.promo_code && user.promo_code.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return null;
        }

        // Apply status filter
        if (statusFilter !== 'all' && processedUser.status !== statusFilter) {
          return null;
        }

        return processedUser;
      }).filter(Boolean) || [];

      return {
        users: processedUsers,
        totalCount: processedUsers.length
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
