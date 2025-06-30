import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from './useCurrentUser';

export const useTripHistory = () => {
  const { user } = useCurrentUser();

  const saveTripToHistory = async (tripData: {
    role: 'driver' | 'passenger';
    origin: { lat: number; lng: number; address: string };
    destination: { lat: number; lng: number; address: string };
    departureTime: Date;
    seats?: number;
    vehicleType?: string;
    fareAmount?: number;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_trip_history')
        .insert({
          user_id: user.id,
          role: tripData.role,
          origin_text: tripData.origin.address,
          origin_lat: tripData.origin.lat,
          origin_lng: tripData.origin.lng,
          dest_text: tripData.destination.address,
          dest_lat: tripData.destination.lat,
          dest_lng: tripData.destination.lng,
          departure_time: tripData.departureTime.toISOString(),
          vehicle_type: tripData.vehicleType,
          seats: tripData.seats,
          fare_amount: tripData.fareAmount,
          country: user.country || 'RW'
        });

      if (error) {
        console.error('Error saving trip to history:', error);
      } else {
        console.log('Trip saved to history for AI learning');
      }
    } catch (error) {
      console.error('Error in saveTripToHistory:', error);
    }
  };

  return { saveTripToHistory };
}; 