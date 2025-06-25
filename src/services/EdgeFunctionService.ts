
import { supabase } from "@/integrations/supabase/client";
import { isGuestMode } from "@/utils/authUtils";

/**
 * Centralized service for calling Supabase Edge Functions
 * All ride platform backend operations go through these functions
 */
export class EdgeFunctionService {
  
  // Helper method to handle guest mode gracefully
  private static async safeInvoke(functionName: string, options?: any) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, options);
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn(`EdgeFunction ${functionName} failed:`, error);
      throw error;
    }
  }

  /**
   * User Management & Authentication
   */
  static async createOrUpdateUserProfile(profileData: any) {
    return this.safeInvoke('create-or-update-user-profile', {
      body: { profileData }
    });
  }

  static async resolveReferral(referralCode: string, refereeId: string, refereeRole: string) {
    return this.safeInvoke('resolve-referral', {
      body: { referralCode, refereeId, refereeRole }
    });
  }

  /**
   * Geolocation & Trip Management
   */
  static async getLiveDrivers(lat: number, lng: number, radius = 10, vehicleType?: string) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      ...(vehicleType && { vehicleType })
    });

    return this.safeInvoke(`get-live-drivers?${params}`);
  }

  static async createTrip(tripData: any) {
    return this.safeInvoke('create-trip', {
      body: tripData
    });
  }

  static async getNearbyOpenTrips(lat: number, lng: number, radius = 10, vehicleType?: string, limit = 20) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      limit: limit.toString(),
      ...(vehicleType && { vehicleType })
    });

    return this.safeInvoke(`get-nearby-open-trips?${params}`);
  }

  static async matchPassengerDriver(action: 'find_matches' | 'create_booking', passengerTripId: string, driverTripId?: string) {
    return this.safeInvoke('match-passenger-driver', {
      body: { action, passengerTripId, driverTripId }
    });
  }

  /**
   * AI & Smart Features
   */
  static async callAIRouter(taskType: string, prompt: string, context?: any, preferredModel?: string, complexity?: 'simple' | 'medium' | 'complex') {
    return this.safeInvoke('ai-router', {
      body: { taskType, prompt, context, preferredModel, complexity }
    });
  }

  static async checkFraud(userBehavior: any, deviceData: any, bookingPattern: any) {
    return this.safeInvoke('ai-fraud-check', {
      body: { userBehavior, deviceData, bookingPattern }
    });
  }

  /**
   * Rewards & Referrals
   */
  static async validateReferralPoints() {
    return this.safeInvoke('validate-referral-points');
  }

  /**
   * Communication
   */
  static async sendWhatsAppInvite(phoneNumber: string, messageType: string, tripData?: any, promoCode?: string, language = 'en') {
    return this.safeInvoke('send-whatsapp-invite', {
      body: { phoneNumber, messageType, tripData, promoCode, language }
    });
  }

  /**
   * Utilities
   */
  static async reverseGeocode(lat: number, lng: number) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString()
    });

    return this.safeInvoke(`reverse-geocode?${params}`);
  }

  static async getAppConfig() {
    return this.safeInvoke('get-app-config');
  }

  /**
   * Safety & Maintenance
   */
  static async submitIncidentReport(type: string, message: string, tripId?: string, metadata?: any) {
    return this.safeInvoke('submit-incident-report', {
      body: { type, message, tripId, metadata }
    });
  }

  static async autoExpireTrips() {
    return this.safeInvoke('auto-expire-trips');
  }

  /**
   * Convenience methods for common AI tasks
   */
  static async explainError(errorMessage: string, context?: any) {
    return this.callAIRouter('explain-error', 
      `Explain this error and provide actionable solutions: ${errorMessage}`, 
      context
    );
  }

  static async localizeCopy(text: string, targetLanguage: 'kn' | 'fr' | 'en', context?: string) {
    return this.callAIRouter('localize', 
      `Translate this text to ${targetLanguage} for a Rwandan ride-booking app: "${text}"${context ? ` Context: ${context}` : ''}`,
      { targetLanguage, originalText: text }
    );
  }

  static async generateUXSuggestions(currentPage: string, userFeedback?: string) {
    return this.callAIRouter('ux-recommendations',
      `Provide UX improvements for ${currentPage} page in a Kigali ride-booking app.${userFeedback ? ` User feedback: ${userFeedback}` : ''}`,
      { page: currentPage, platform: 'mobile-pwa' }
    );
  }
}
