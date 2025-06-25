
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

interface AdminTripsParams {
  refreshTrigger: number;
  searchQuery: string;
  roleFilter: string;
  statusFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  fareMinFilter: string;
  fareMaxFilter: string;
}

type TripRole = 'passenger' | 'driver';
type TripStatus = 'pending' | 'open' | 'matched' | 'completed' | 'cancelled';

export const useAdminTrips = ({ 
  refreshTrigger, 
  searchQuery, 
  roleFilter, 
  statusFilter,
  dateFromFilter,
  dateToFilter,
  fareMinFilter,
  fareMaxFilter
}: AdminTripsParams) => {
  return useQuery({
    queryKey: ['admin-trips', refreshTrigger, searchQuery, roleFilter, statusFilter, dateFromFilter, dateToFilter, fareMinFilter, fareMaxFilter],
    queryFn: async () => {
      // Fetch trips with user information - RLS will handle admin access
      let query = supabase
        .from('trips')
        .select(`
          id,
          role,
          from_location,
          to_location,
          scheduled_time,
          fare,
          seats_available,
          status,
          created_at,
          user_id,
          vehicle_type,
          description,
          is_negotiable,
          users!inner(
            id,
            promo_code
          )
        `);

      // Apply role filter
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply date range filter
      if (dateFromFilter) {
        query = query.gte('scheduled_time', dateFromFilter);
      }
      if (dateToFilter) {
        query = query.lte('scheduled_time', dateToFilter);
      }

      // Apply fare range filter
      if (fareMinFilter) {
        query = query.gte('fare', parseFloat(fareMinFilter));
      }
      if (fareMaxFilter) {
        query = query.lte('fare', parseFloat(fareMaxFilter));
      }

      const { data: tripsData, error: tripsError } = await query.order('created_at', { ascending: false });
      if (tripsError) throw tripsError;

      // Fetch bookings data for match information
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('driver_trip_id, passenger_trip_id, confirmed');

      if (bookingsError) throw bookingsError;

      // Process trips data
      const processedTrips = tripsData?.map(trip => {
        const relatedBookings = bookingsData?.filter(
          booking => booking.driver_trip_id === trip.id || booking.passenger_trip_id === trip.id
        ) || [];

        // Ensure role and status are properly typed
        const role: TripRole = trip.role === 'driver' ? 'driver' : 'passenger';
        const status: TripStatus = ['pending', 'open', 'matched', 'completed', 'cancelled'].includes(trip.status) 
          ? trip.status as TripStatus 
          : 'pending';

        const processedTrip = {
          id: trip.id,
          role,
          status,
          fromLocation: trip.from_location,
          toLocation: trip.to_location,
          scheduledTime: trip.scheduled_time,
          fare: trip.fare || 0,
          seatsAvailable: trip.seats_available || 1,
          createdAt: trip.created_at,
          createdBy: trip.users?.promo_code || `User ${trip.user_id.slice(0, 8)}`,
          vehicleType: trip.vehicle_type,
          description: trip.description,
          isNegotiable: trip.is_negotiable,
          matchedCount: relatedBookings.length,
          userId: trip.user_id
        };

        // Apply search filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            processedTrip.id.toLowerCase().includes(searchLower) ||
            processedTrip.fromLocation.toLowerCase().includes(searchLower) ||
            processedTrip.toLocation.toLowerCase().includes(searchLower) ||
            processedTrip.createdBy.toLowerCase().includes(searchLower);
          
          if (!matchesSearch) return null;
        }

        return processedTrip;
      }).filter(Boolean) || [];

      return {
        trips: processedTrips,
        totalCount: processedTrips.length
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
