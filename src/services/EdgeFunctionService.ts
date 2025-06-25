
import { supabase } from "@/integrations/supabase/client";

/**
 * Centralized service for calling Supabase Edge Functions
 * All ride platform backend operations go through these functions
 */
export class EdgeFunctionService {
  
  /**
   * User Management & Authentication
   */
  static async createOrUpdateUserProfile(profileData: any) {
    const { data, error } = await supabase.functions.invoke('create-or-update-user-profile', {
      body: { profileData }
    });
    
    if (error) throw error;
    return data;
  }

  static async resolveReferral(referralCode: string, refereeId: string, refereeRole: string) {
    const { data, error } = await supabase.functions.invoke('resolve-referral', {
      body: { referralCode, refereeId, refereeRole }
    });
    
    if (error) throw error;
    return data;
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

    const { data, error } = await supabase.functions.invoke(`get-live-drivers?${params}`);
    
    if (error) throw error;
    return data;
  }

  static async createTrip(tripData: any) {
    const { data, error } = await supabase.functions.invoke('create-trip', {
      body: tripData
    });
    
    if (error) throw error;
    return data;
  }

  static async getNearbyOpenTrips(lat: number, lng: number, radius = 10, vehicleType?: string, limit = 20) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      limit: limit.toString(),
      ...(vehicleType && { vehicleType })
    });

    const { data, error } = await supabase.functions.invoke(`get-nearby-open-trips?${params}`);
    
    if (error) throw error;
    return data;
  }

  static async matchPassengerDriver(action: 'find_matches' | 'create_booking', passengerTripId: string, driverTripId?: string) {
    const { data, error } = await supabase.functions.invoke('match-passenger-driver', {
      body: { action, passengerTripId, driverTripId }
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * AI & Smart Features
   */
  static async callAIRouter(taskType: string, prompt: string, context?: any, preferredModel?: string, complexity?: 'simple' | 'medium' | 'complex') {
    const { data, error } = await supabase.functions.invoke('ai-router', {
      body: { taskType, prompt, context, preferredModel, complexity }
    });
    
    if (error) throw error;
    return data;
  }

  static async checkFraud(userBehavior: any, deviceData: any, bookingPattern: any) {
    const { data, error } = await supabase.functions.invoke('ai-fraud-check', {
      body: { userBehavior, deviceData, bookingPattern }
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * Rewards & Referrals
   */
  static async validateReferralPoints() {
    const { data, error } = await supabase.functions.invoke('validate-referral-points');
    
    if (error) throw error;
    return data;
  }

  /**
   * Communication
   */
  static async sendWhatsAppInvite(phoneNumber: string, messageType: string, tripData?: any, promoCode?: string, language = 'en') {
    const { data, error } = await supabase.functions.invoke('send-whatsapp-invite', {
      body: { phoneNumber, messageType, tripData, promoCode, language }
    });
    
    if (error) throw error;
    return data;
  }

  /**
   * Utilities
   */
  static async reverseGeocode(lat: number, lng: number) {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString()
    });

    const { data, error } = await supabase.functions.invoke(`reverse-geocode?${params}`);
    
    if (error) throw error;
    return data;
  }

  static async getAppConfig() {
    const { data, error } = await supabase.functions.invoke('get-app-config');
    
    if (error) throw error;
    return data;
  }

  /**
   * Safety & Maintenance
   */
  static async submitIncidentReport(type: string, message: string, tripId?: string, metadata?: any) {
    const { data, error } = await supabase.functions.invoke('submit-incident-report', {
      body: { type, message, tripId, metadata }
    });
    
    if (error) throw error;
    return data;
  }

  static async autoExpireTrips() {
    const { data, error } = await supabase.functions.invoke('auto-expire-trips');
    
    if (error) throw error;
    return data;
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
