
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { EdgeFunctionService } from "@/services/EdgeFunctionService";

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
      const response = await EdgeFunctionService.createTrip({
        ...tripData,
        role: 'passenger',
        seats_available: 1
      });

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
