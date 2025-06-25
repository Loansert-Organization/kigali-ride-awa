
import { supabase } from "@/integrations/supabase/client";

interface CreateTripRequest {
  from_location: string;
  to_location: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
  role: 'passenger' | 'driver';
  seats_available?: number;
  fare?: number;
  is_negotiable?: boolean;
  description?: string;
}

interface CreateTripResponse {
  success: boolean;
  trip: any;
  geocoding?: {
    from_geocoded: boolean;
    to_geocoded: boolean;
  };
  error?: string;
}

interface MatchResponse {
  success: boolean;
  matches?: any[];
  passenger_trip?: any;
  total_matches?: number;
  booking?: any;
  message?: string;
  error?: string;
}

export class EdgeFunctionService {
  static async createTrip(tripData: CreateTripRequest): Promise<CreateTripResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('create-trip', {
        body: tripData
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.createTrip error:', error);
      throw error;
    }
  }

  static async matchPassengerDriver(
    action: 'find_matches' | 'create_booking',
    passengerTripId: string,
    driverTripId?: string
  ): Promise<MatchResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('match-passenger-driver', {
        body: {
          action,
          passengerTripId,
          driverTripId
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.matchPassengerDriver error:', error);
      throw error;
    }
  }

  static async getLiveDrivers(params: {
    lat: number;
    lng: number;
    radius?: number;
    vehicleType?: string;
  }) {
    try {
      const searchParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
        radius: (params.radius || 10).toString(),
        ...(params.vehicleType && { vehicleType: params.vehicleType })
      });

      const { data, error } = await supabase.functions.invoke('get-live-drivers', {
        body: { searchParams: searchParams.toString() }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.getLiveDrivers error:', error);
      throw error;
    }
  }

  static async getNearbyOpenTrips(params: {
    lat: number;
    lng: number;
    radius?: number;
    vehicleType?: string;
    limit?: number;
  }) {
    try {
      const searchParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
        radius: (params.radius || 10).toString(),
        limit: (params.limit || 20).toString(),
        ...(params.vehicleType && { vehicleType: params.vehicleType })
      });

      const { data, error } = await supabase.functions.invoke('get-nearby-open-trips', {
        body: { searchParams: searchParams.toString() }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.getNearbyOpenTrips error:', error);
      throw error;
    }
  }

  static async createOrUpdateUserProfile(profileData: {
    role: 'passenger' | 'driver';
    language?: string;
    location_enabled?: boolean;
    notifications_enabled?: boolean;
    onboarding_completed?: boolean;
    referred_by?: string;
    vehicleData?: {
      vehicle_type: string;
      plate_number: string;
      preferred_zone?: string;
    };
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('create-or-update-user-profile', {
        body: { profileData }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.createOrUpdateUserProfile error:', error);
      throw error;
    }
  }

  static async getMapsApiKey() {
    try {
      const { data, error } = await supabase.functions.invoke('maps-sig');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.getMapsApiKey error:', error);
      throw error;
    }
  }

  static async reverseGeocode(lat: number, lng: number) {
    try {
      const { data, error } = await supabase.functions.invoke('reverse-geocode', {
        body: { lat, lng }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.reverseGeocode error:', error);
      throw error;
    }
  }

  static async sendWhatsAppInvite(phoneNumber: string, message: string) {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
        body: { phoneNumber, message }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.sendWhatsAppInvite error:', error);
      throw error;
    }
  }

  static async resolveReferral(promoCode: string, refereeRole: 'passenger' | 'driver') {
    try {
      const { data, error } = await supabase.functions.invoke('resolve-referral', {
        body: { promoCode, refereeRole }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('EdgeFunctionService.resolveReferral error:', error);
      throw error;
    }
  }
}
