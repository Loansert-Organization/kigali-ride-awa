
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { TripData, BookingData } from '@/types/api';

interface TripWithBookings extends TripData {
  bookings?: Pick<BookingData, 'id' | 'confirmed' | 'passenger_trip_id'>[];
}

interface ChartDataPoint {
  date: string;
  earnings: number;
  trips: number;
}

interface EarningsData {
  today: number;
  thisWeek: number;
  thisMonth: number;
  allTime: number;
  completedTrips: TripWithBookings[];
  chartData: ChartDataPoint[];
}

export const useDriverEarnings = (selectedPeriod: string) => {
  return useQuery({
    queryKey: ['driver-earnings', selectedPeriod],
    queryFn: async () => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Calculate date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch completed trips with bookings
      const { data: trips, error } = await supabase
        .from('trips')
        .select(`
          *,
          bookings (
            id,
            confirmed,
            passenger_trip_id
          )
        `)
        .eq('role', 'driver')
        .eq('user_id', currentUser.id)
        .eq('status', 'completed')
        .order('scheduled_time', { ascending: false });

      if (error) throw error;

      // Calculate earnings
      const calculateEarnings = (trips: TripWithBookings[], fromDate?: Date) => {
        return trips
          .filter(trip => !fromDate || new Date(trip.scheduled_time) >= fromDate)
          .reduce((total, trip) => {
            const seatsBooked = trip.bookings?.length || 0;
            const farePerSeat = trip.fare || 0;
            return total + (farePerSeat * seatsBooked);
          }, 0);
      };

      const todayEarnings = calculateEarnings(trips, today);
      const weekEarnings = calculateEarnings(trips, weekAgo);
      const monthEarnings = calculateEarnings(trips, monthAgo);
      const allTimeEarnings = calculateEarnings(trips);

      // Generate chart data
      const chartData = [];
      const period = selectedPeriod === '7days' ? 7 : 30;
      
      for (let i = period - 1; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayEarnings = trips
          .filter(trip => {
            const tripDate = new Date(trip.scheduled_time);
            return tripDate >= dayStart && tripDate < dayEnd;
          })
          .reduce((total, trip) => {
            const seatsBooked = trip.bookings?.length || 0;
            const farePerSeat = trip.fare || 0;
            return total + (farePerSeat * seatsBooked);
          }, 0);

        chartData.push({
          date: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          earnings: dayEarnings,
          trips: trips.filter(trip => {
            const tripDate = new Date(trip.scheduled_time);
            return tripDate >= dayStart && tripDate < dayEnd;
          }).length
        });
      }

      return {
        today: todayEarnings,
        thisWeek: weekEarnings,
        thisMonth: monthEarnings,
        allTime: allTimeEarnings,
        completedTrips: trips,
        chartData
      } as EarningsData;
    },
    enabled: !!localStorage.getItem('currentUser')
  });
};
