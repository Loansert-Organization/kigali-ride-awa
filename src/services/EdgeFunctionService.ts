
// Services for Edge Function calls with proper error handling and type safety
import { supabase } from "@/integrations/supabase/client";
import { TripData, BookingData } from "@/types/api";
import { UserProfile } from "@/types/user";
import { logError } from "@/utils/errorHandlers";

export interface CreateTripRequest {
  user_id: string;
  role: 'passenger' | 'driver';
  from_location: string;
  from_lat?: number;
  from_lng?: number;
  to_location: string;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
  seats_available: number;
  fare?: number;
  is_negotiable: boolean;
  description?: string;
}

export interface CreateTripResponse {
  success: boolean;
  trip?: TripData;
  error?: string;
}

export interface NearbyTripsResponse {
  success: boolean;
  trips?: TripData[];
  error?: string;
}

export interface MatchResponse {
  success: boolean;
  matches?: TripData[];
  booking?: BookingData;
  error?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  whatsapp_url?: string;
  error?: string;
}

export class EdgeFunctionService {
  static async createTrip(tripData: CreateTripRequest): Promise<CreateTripResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-trip', {
        body: tripData
      });

      if (error) throw error;

      return { success: true, trip: data };
    } catch (error) {
      logError('Error creating trip:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create trip' 
      };
    }
  }

  static async getNearbyOpenTrips(
    lat: number,
    lng: number,
    radius: number = 5,
    vehicleType?: string,
    limit: number = 10
  ): Promise<NearbyTripsResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('get-nearby-open-trips', {
        body: { lat, lng, radius, vehicle_type: vehicleType, limit }
      });

      if (error) throw error;

      return { success: true, trips: data?.trips || [] };
    } catch (error) {
      logError('Error fetching nearby trips:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch nearby trips' 
      };
    }
  }

  static async matchPassengerDriver(
    action: string,
    passengerTripId: string,
    driverTripId?: string
  ): Promise<MatchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('match-passenger-driver', {
        body: { 
          action, 
          passenger_trip_id: passengerTripId, 
          driver_trip_id: driverTripId 
        }
      });

      if (error) throw error;

      return { success: true, ...data };
    } catch (error) {
      logError('Error in match-passenger-driver:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process match' 
      };
    }
  }

  static async sendWhatsAppInvite(
    phoneNumber: string,
    messageType: string,
    tripData: Partial<TripData>,
    userData?: Partial<UserProfile>,
    language: string = 'en'
  ): Promise<WhatsAppResponse> {
    try {
      const message = this.generateWhatsAppMessage(messageType, tripData, userData, language);
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: { phoneNumber, message }
      });

      if (error) throw error;

      return { success: true, whatsapp_url: data?.whatsapp_url };
    } catch (error) {
      logError('Error sending WhatsApp invite:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send WhatsApp invite' 
      };
    }
  }

  private static generateWhatsAppMessage(
    type: string, 
    tripData: Partial<TripData>, 
    userData?: Partial<UserProfile>, 
    _language: string = 'en'
  ): string {
    switch (type) {
      case 'booking_request':
        return `🚗 Kigali Ride: Trip booking from ${tripData.from_location} to ${tripData.to_location}. Contact for coordination.`;
      case 'referral_invite':
        return `🎉 Join Kigali Ride using my code: ${userData?.promo_code}. Get rewards for your first trip!`;
      default:
        return 'Kigali Ride: Trip coordination message';
    }
  }
}
