/**
 * Coded by Gemini
 * 
 * src/services/APIClient.ts
 * 
 * Unified, type-safe client for all Supabase Edge Function interactions.
 */
import { supabase } from '@/integrations/supabase/client';
import { EdgeFunctionResponse, UserProfile, DriverTrip, PassengerTrip, DriverVehicle, TripMatch } from '@/types';

// Generic request options for our API client
interface RequestOptions {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
}

/**
 * Singleton API Client for the application.
 * This class centralizes all edge function calls, providing a single,
 * type-safe interface for the rest of the application.
 */
export class APIClient {
  private static instance: APIClient;
  private readonly baseURL: string;
  private readonly isOfflineMode: boolean;

  constructor() {
    this.baseURL = import.meta.env.VITE_SUPABASE_URL || '';
    // Check if we're in offline mode
    const localSession = localStorage.getItem('localSession');
    this.isOfflineMode = !!localSession && !navigator.onLine;
  }

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      // Check for local session first
      const localSession = localStorage.getItem('localSession');
      if (localSession) {
        const session = JSON.parse(localSession);
        return {
          'Authorization': `Bearer local-${session.user.id}`,
          'Content-Type': 'application/json',
        };
      }

      // Try to get Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        };
      }
    } catch (error) {
      console.error('Error getting auth headers:', error);
    }
    
    // Fallback headers
    return {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    };
  }

  /**
   * Generic request handler for Edge Functions
   */
  async request<T>(
    functionName: string,
    options?: RequestOptions
  ): Promise<EdgeFunctionResponse<T>> {
    // Handle offline mode
    if (!navigator.onLine || this.isOfflineMode) {
      console.log(`Offline mode: Skipping API call to ${functionName}`);
      return {
        success: false,
        error: {
          message: 'You are currently offline. Your data will sync when connection is restored.',
          code: 'OFFLINE',
        }
      };
    }

    const authHeaders = await this.getAuthHeaders();
    const url = `${this.baseURL}/functions/v1/${functionName}`;
    
    try {
      // Add timeout to detect connection issues
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(options?.body),
        headers: {
          ...authHeaders,
          ...options?.headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`Edge Function Error (${functionName}):`, response.statusText);
        throw new Error(response.statusText);
      }
      
      const data = await response.json();

      // Handle both direct responses and wrapped responses
      if (data && typeof data === 'object') {
        // If data has success/error pattern, return as is
        if ('success' in data || 'error' in data) {
          return data as EdgeFunctionResponse<T>;
        }
        // Otherwise, wrap in success response
        return {
          success: true,
          data: data as T
        };
      }
      
      // Fallback for unexpected response format
      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      const e = error as Error;
      console.error(`APIClient Error (${functionName}):`, e.message);
      
      // Handle timeout errors specifically
      if (e.name === 'AbortError') {
        return {
          success: false,
          error: {
            message: 'Connection timeout. Please check your internet connection.',
            code: 'TIMEOUT',
          }
        };
      }
      
      // Handle network errors
      if (e.message.includes('network') || e.message.includes('fetch')) {
        return {
          success: false,
          error: {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR',
          }
        };
      }
      
      return {
        success: false,
        error: {
          message: e.message || 'An unknown API error occurred.',
          code: 'UNKNOWN_ERROR',
        },
      };
    }
  }
  
  // ===================================
  // AUTH ENDPOINTS
  // ===================================
  auth = {
    sendOtp: (phoneNumber: string) => 
      this.request<{ messageId: string }>('send-otp', { body: { phoneNumber } }),
      
    verifyOtp: (phoneNumber: string, otpCode: string) =>
      this.request<{ user: UserProfile, session: any }>('verify-otp', { body: { phoneNumber, otpCode } }),
      
    checkDuplicatePhone: (phoneNumber: string) =>
      this.request<{ exists: boolean }>('check-duplicate-phone', { body: { phoneNumber } }),
  };

  // ===================================
  // USER PROFILE ENDPOINTS
  // ===================================
  user = {
    createOrUpdateProfile: (profileData: Partial<UserProfile> & { vehicleData?: any }) =>
      this.request<UserProfile>('create-or-update-user-profile', { body: { profileData } }),
      
    updateStatus: (is_online: boolean, current_location?: {lat: number, lng: number}) =>
      this.request('update-user-status', { body: { is_online, current_location } }),
  };

  // ===================================
  // TRIPS ENDPOINTS
  // ===================================
  trips = {
    createPassengerTrip: async (tripData: Partial<PassengerTrip>) => {
      // Add default status and ensure all required fields
      const dataWithDefaults = {
        ...tripData,
        status: tripData.status || 'requested',
        created_at: new Date().toISOString()
      };
      
      // Direct database insert instead of edge function (since edge functions aren't deployed)
      const { data, error } = await supabase
        .from('passenger_trips')
        .insert(dataWithDefaults)
        .select()
        .single();
        
      if (error) {
        console.error('Database error creating passenger trip:', error);
        return {
          success: false,
          error: { message: error.message || 'Failed to create trip request' }
        };
      }
      
      console.log('Passenger trip created successfully:', data);
      return {
        success: true,
        data
      };
    },

    createDriverTrip: async (tripData: Partial<DriverTrip>) => {
      // Add default status and ensure all required fields
      const dataWithDefaults = {
        ...tripData,
        status: tripData.status || 'open',
        created_at: new Date().toISOString()
      };
      
      // Direct database insert instead of edge function (since edge functions aren't deployed)
      const { data, error } = await supabase
        .from('driver_trips')
        .insert(dataWithDefaults)
        .select()
        .single();
        
      if (error) {
        console.error('Database error creating driver trip:', error);
        return {
          success: false,
          error: { message: error.message || 'Failed to create trip' }
        };
      }
      
      console.log('Driver trip created successfully:', data);
      return {
        success: true,
        data
      };
    },

    getDriverTrips: (driverId: string) =>
      this.request<DriverTrip[]>('get-driver-trips', { body: { driverId } }),
      
    getMatchesForRequest: (requestId: string) =>
      this.request<DriverTrip[]>('get-matches-for-request', { body: { requestId } }),
      
    getLiveDrivers: (location: { lat: number, lng: number }, radius?: number) =>
      this.request<DriverTrip[]>('get-live-drivers', { body: { location, radius } }),
      
    getNearbyOpenTrips: (location: { lat: number, lng: number }, radius?: number) =>
      this.request<DriverTrip[]>('get-nearby-open-trips', { body: { location, radius } }),
      
    matchPassengerDriver: (passengerTripId: string, driverTripId: string) =>
      this.request<TripMatch>('match-passenger-driver', { body: { passengerTripId, driverTripId } }),
  };
  
  // ===================================
  // VEHICLES ENDPOINTS
  // ===================================
  vehicles = {
    createDriverVehicle: async (vehicleData: Partial<DriverVehicle>) => {
      // Add defaults and ensure all required fields
      const dataWithDefaults = {
        ...vehicleData,
        is_verified: false,
        created_at: new Date().toISOString()
      };
      
      // Direct database insert instead of edge function (since edge functions aren't deployed)
      const { data, error } = await supabase
        .from('driver_vehicles')
        .insert(dataWithDefaults)
        .select()
        .single();
        
      if (error) {
        console.error('Database error creating vehicle:', error);
        return {
          success: false,
          error: { message: error.message || 'Failed to create vehicle' }
        };
      }
      
      console.log('Vehicle created successfully:', data);
      return {
        success: true,
        data
      };
    },
  };

  // ===================================
  // MAPS & LOCATION ENDPOINTS
  // ===================================
  maps = {
    reverseGeocode: (lat: number, lng: number) =>
      this.request<{ address: string }>('reverse-geocode', { body: { lat, lng } }),
      
    getMapSignature: (request: string) =>
      this.request<{ signature: string }>('maps-sig', { body: { request } }),
  };

  // ===================================
  // NOTIFICATIONS ENDPOINTS
  // ===================================
  notifications = {
    sendPushNotification: (userId: string, title: string, body: string, data?: Record<string, any>) =>
      this.request('send-push-notification', { body: { userId, title, body, data } }),
      
    sendWhatsAppTemplate: (phoneNumber: string, templateName: string, parameters?: string[]) =>
      this.request('send-whatsapp-template', { body: { phoneNumber, templateName, parameters } }),
      
    sendWhatsAppInvite: (phoneNumber: string, inviteLink: string) =>
      this.request('send-whatsapp-invite', { body: { phoneNumber, inviteLink } }),
      
    notifyTripMatched: (matchId: string) =>
      this.request('notify-trip-matched', { body: { matchId } }),
  };

  // ===================================
  // INCIDENT REPORTING
  // ===================================
  incidents = {
    submitIncidentReport: (incidentData: { 
      tripId?: string, 
      type: string, 
      message: string 
    }) =>
      this.request('submit-incident-report', { body: incidentData }),
  };

  // ===================================
  // REFERRALS & REWARDS
  // ===================================
  referrals = {
    resolveReferral: (referralCode: string) =>
      this.request('resolve-referral', { body: { referralCode } }),
      
    validateReferralPoints: (userId: string) =>
      this.request('validate-referral-points', { body: { userId } }),
  };

  // ===================================
  // APP CONFIGURATION
  // ===================================
  config = {
    getAppConfig: () =>
      this.request<{ 
        mapApiKey: string,
        whatsappEnabled: boolean,
        maintenanceMode: boolean 
      }>('get-app-config'),
  };
}

export const apiClient = APIClient.getInstance(); 