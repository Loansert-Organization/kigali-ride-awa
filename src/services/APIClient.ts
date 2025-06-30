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
class APIClient {
  private static instance: APIClient;

  private constructor() {}

  public static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  /**
   * A generic and reusable method to invoke a Supabase Edge Function.
   * Handles the call, error handling, and response typing.
   * @param functionName The name of the edge function to invoke.
   * @param options The request options (body, headers).
   * @returns A promise that resolves to an EdgeFunctionResponse.
   */
  private async request<T>(
    functionName: string,
    options?: RequestOptions
  ): Promise<EdgeFunctionResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: options?.body,
        headers: options?.headers,
      });

      if (error) {
        throw new Error(error.message);
      }
      
      return data as EdgeFunctionResponse<T>;
    } catch (error) {
      const e = error as Error;
      console.error(`APIClient Error (${functionName}):`, e.message);
      return {
        success: false,
        error: {
          message: e.message || 'An unknown API error occurred.',
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
    createPassengerTrip: (tripData: Partial<PassengerTrip>) =>
      this.request<PassengerTrip>('create-passenger-trip', { body: { tripData } }),
      
    createDriverTrip: (tripData: Partial<DriverTrip>) =>
      this.request<DriverTrip>('create-driver-trip', { body: { tripData } }),
      
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
    createDriverVehicle: (vehicleData: Partial<DriverVehicle>) =>
      this.request<DriverVehicle>('create-driver-vehicle', { body: { vehicleData } }),
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