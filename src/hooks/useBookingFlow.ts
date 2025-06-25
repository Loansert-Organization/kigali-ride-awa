
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { EdgeFunctionService, CreateTripRequest } from "@/services/EdgeFunctionService";

export interface TripData {
  fromLocation: string;
  toLocation: string;
  fromLat?: number;
  fromLng?: number;
  toLat?: number;
  toLng?: number;
  scheduledTime: string;
  vehicleType: string;
  description?: string;
}

export const useBookingFlow = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const createPassengerTrip = async (tripData: TripData) => {
    setIsLoading(true);
    try {
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Convert TripData to CreateTripRequest format
      const tripRequest: CreateTripRequest = {
        user_id: currentUser.id,
        role: 'passenger',
        from_location: tripData.fromLocation,
        from_lat: tripData.fromLat,
        from_lng: tripData.fromLng,
        to_location: tripData.toLocation,
        to_lat: tripData.toLat,
        to_lng: tripData.toLng,
        vehicle_type: tripData.vehicleType,
        scheduled_time: tripData.scheduledTime,
        seats_available: 1,
        is_negotiable: true,
        description: tripData.description
      };

      const response = await EdgeFunctionService.createTrip(tripRequest);

      if (response.success) {
        toast({
          title: "Trip Request Created!",
          description: "Looking for available drivers..."
        });
        
        // Navigate to matches page with trip ID
        navigate('/matches', { 
          state: { tripId: response.trip.id, tripData } 
        });
        
        return response.trip;
      }
    } catch (error) {
      console.error('Error creating passenger trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const findMatches = async (passengerTripId: string) => {
    try {
      const response = await EdgeFunctionService.matchPassengerDriver(
        'find_matches',
        passengerTripId
      );

      if (response.success) {
        return response.matches || [];
      }
      return [];
    } catch (error) {
      console.error('Error finding matches:', error);
      return [];
    }
  };

  const createBooking = async (passengerTripId: string, driverTripId: string) => {
    setIsLoading(true);
    try {
      const response = await EdgeFunctionService.matchPassengerDriver(
        'create_booking',
        passengerTripId,
        driverTripId
      );

      if (response.success) {
        toast({
          title: "Booking Confirmed!",
          description: "Your ride has been booked successfully"
        });
        return response.booking;
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Could not confirm your booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPassengerTrip,
    findMatches,
    createBooking,
    isLoading
  };
};
