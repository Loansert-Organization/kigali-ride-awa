
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface AdminUsersParams {
  refreshTrigger: number;
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
}

type UserRole = 'passenger' | 'driver' | 'admin';
type UserStatus = 'active' | 'banned' | 'flagged';

export const useAdminUsers = ({ refreshTrigger, searchQuery, roleFilter, statusFilter }: AdminUsersParams) => {
  return useQuery({
    queryKey: ['admin-users', refreshTrigger, searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      // Fetch users with optional filtering - RLS will handle admin access
      let query = supabase
        .from('users')
        .select(`
          id, 
          role, 
          created_at, 
          updated_at, 
          promo_code,
          auth_user_id
        `);

      // Apply role filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data: usersData, error: usersError } = await query.order('created_at', { ascending: false });
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
        const status: UserStatus = Math.random() > 0.9 ? 'flagged' : Math.random() > 0.95 ? 'banned' : 'active';
        
        // Ensure role is properly typed, with fallback to 'passenger'
        const role: UserRole = (user.role === 'driver' || user.role === 'admin') ? user.role : 'passenger';
        
        const processedUser = {
          id: user.id,
          name: `User ${user.id.slice(0, 8)}`, // Mock name - in real app would come from profile
          phone: '+250788123456', // Mock phone - in real app would come from profile
          role,
          tripsCount: userTrips.length,
          lastSeen: new Date(user.updated_at) > new Date(Date.now() - 24*60*60*1000) ? 'today' : 
                   new Date(user.updated_at).toLocaleDateString(),
          status,
          dateJoined: user.created_at,
          promoCode: user.promo_code
        };

        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            processedUser.name.toLowerCase().includes(searchLower) ||
            processedUser.phone.includes(searchQuery) ||
            (processedUser.promoCode && processedUser.promoCode.toLowerCase().includes(searchLower));
          
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
