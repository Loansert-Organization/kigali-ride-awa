import { supabase } from '@/integrations/supabase/client';
import { 
  EdgeFunctionResponse, 
  TripData, 
  BookingData,
  DriverProfile,
  UserProfile,
  PushNotificationPayload 
} from '@/types/api';

interface RequestOptions {
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

interface APIError {
  message: string;
  code?: string;
  statusCode?: number;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: UserProfile;
}

interface TripMatch {
  id: string;
  trip_id: string;
  driver_id: string;
  passenger_id: string;
  status: string;
}

/**
 * Unified API Client for all edge function calls
 * Groups related functions together for better organization
 */
export class APIClient {
  private static instance: APIClient;

  private constructor() {}

  static getInstance(): APIClient {
    if (!APIClient.instance) {
      APIClient.instance = new APIClient();
    }
    return APIClient.instance;
  }

  /**
   * Base request method with error handling and typing
   */
  private async request<T>(
    functionName: string, 
    options?: RequestOptions
  ): Promise<EdgeFunctionResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: options?.body,
        headers: options?.headers
      });

      if (error) {
        throw {
          message: error.message || 'Request failed',
          code: error.code,
          statusCode: error.status
        } as APIError;
      }

      return {
        success: true,
        data: data as T
      };
    } catch (error) {
      const apiError = error as APIError;
      return {
        success: false,
        error: apiError.message || 'An unexpected error occurred'
      };
    }
  }

  /**
   * Authentication related methods
   */
  auth = {
    sendOTP: (phoneNumber: string) => 
      this.request<{ messageId: string }>('send-otp', {
        body: { phone_number: phoneNumber }
      }),

    verifyOTP: (phoneNumber: string, otpCode: string) => 
      this.request<{ user: UserProfile; session: Session }>('verify-otp', {
        body: { phone_number: phoneNumber, otp_code: otpCode }
      }),

    createOrUpdateProfile: (profileData: Partial<UserProfile>) =>
      this.request<UserProfile>('create-or-update-user-profile', {
        body: profileData
      })
  };

  /**
   * Trip management methods
   */
  trips = {
    create: (tripData: Partial<TripData>) =>
      this.request<TripData>('create-trip', {
        body: tripData
      }),

    getNearby: (location: { lat: number; lng: number }, radius?: number) =>
      this.request<TripData[]>('get-nearby-open-trips', {
        body: { location, radius: radius || 5 }
      }),

    match: (passengerTripId: string, driverTripId?: string) =>
      this.request<{ match: TripMatch }>('match-passenger-driver', {
        body: { 
          action: 'match',
          passenger_trip_id: passengerTripId,
          driver_trip_id: driverTripId
        }
      }),

    smartMatch: (passengerTripId: string, options?: { maxDistance?: number; maxTimeDiff?: number }) =>
      this.request<{ matches: TripData[]; matchCount: number }>('smart-trip-matcher', {
        body: {
          passengerTripId,
          maxDistance: options?.maxDistance || 5,
          maxTimeDiff: options?.maxTimeDiff || 30
        }
      })
  };

  /**
   * Driver related methods
   */
  drivers = {
    getLive: (bounds?: { north: number; south: number; east: number; west: number }) =>
      this.request<DriverProfile[]>('get-live-drivers', {
        body: { bounds }
      }),

    updateStatus: (driverId: string, isOnline: boolean) =>
      this.request<{ success: boolean }>('update-driver-status', {
        body: { driver_id: driverId, is_online: isOnline }
      })
  };

  /**
   * Notification methods
   */
  notifications = {
    sendPush: (notification: PushNotificationPayload & { userId: string }) =>
      this.request<{ success: boolean }>('send-push-notification', {
        body: notification
      }),

    sendWhatsApp: (phoneNumber: string, message: string, templateName?: string) =>
      this.request<{ messageId: string }>('send-whatsapp-template', {
        body: { phone_number: phoneNumber, message, template_name: templateName }
      })
  };

  /**
   * AI Assistant methods
   */
  ai = {
    generateCode: (prompt: string, context?: string) =>
      this.request<{ code: string; explanation: string }>('ai-generate-code', {
        body: { prompt, context }
      }),

    fixCode: (code: string, error: string) =>
      this.request<{ fixedCode: string; explanation: string }>('ai-fix-code', {
        body: { code, error }
      }),

    localize: (text: string, targetLanguage: string) =>
      this.request<{ translatedText: string }>('ai-localize', {
        body: { text, target_language: targetLanguage }
      }),

    router: (taskType: string, prompt: string, context?: string) =>
      this.request<{ result: unknown; model: string }>('ai-router', {
        body: { taskType, prompt, context }
      })
  };

  /**
   * Admin methods
   */
  admin = {
    getConfig: () =>
      this.request<{ config: Record<string, unknown> }>('get-app-config'),

    validateReferral: (referralCode: string, userId: string) =>
      this.request<{ valid: boolean; points: number }>('validate-referral-points', {
        body: { referral_code: referralCode, user_id: userId }
      }),

    submitIncident: (report: { type: string; message: string; tripId?: string }) =>
      this.request<{ reportId: string }>('submit-incident-report', {
        body: report
      })
  };

  /**
   * Utility methods
   */
  utils = {
    reverseGeocode: (lat: number, lng: number) =>
      this.request<{ address: string; placeId: string }>('reverse-geocode', {
        body: { lat, lng }
      }),

    getMapSignature: (params: Record<string, unknown>) =>
      this.request<{ url: string }>('maps-sig', {
        body: params
      })
  };
}

// Export singleton instance
export const apiClient = APIClient.getInstance(); 