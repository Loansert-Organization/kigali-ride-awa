
import { supabase } from '@/integrations/supabase/client';

class SecureGoogleMapsService {
  private apiKey: string | null = null;
  private keyTimestamp: number = 0;
  private keyTTL: number = 60; // seconds
  private isInitialized: boolean = false;

  constructor() {
    console.log('🗺️ Initializing SecureGoogleMapsService');
  }

  private async fetchSecureApiKey(): Promise<string> {
    const now = Date.now();
    
    // Check if we have a valid cached key
    if (this.apiKey && (now - this.keyTimestamp) < (this.keyTTL * 1000)) {
      console.log('✅ Using cached Google Maps API key');
      return this.apiKey;
    }

    console.log('🔄 Fetching fresh Google Maps API key...');
    
    try {
      const { data, error } = await supabase.functions.invoke('maps-sig');
      
      if (error) {
        console.error('❌ Error fetching secure maps key:', error);
        throw new Error(`Failed to fetch secure API key: ${error.message}`);
      }
      
      if (!data?.key) {
        throw new Error('No API key received from server');
      }
      
      this.apiKey = data.key;
      this.keyTimestamp = now;
      this.keyTTL = data.ttl || 60;
      
      console.log('✅ Received fresh API key with TTL:', this.keyTTL);
      return this.apiKey;
    } catch (error) {
      console.error('❌ Failed to fetch secure Google Maps key:', error);
      throw error;
    }
  }

  async loadGoogleMaps(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Google Maps already initialized');
      return;
    }

    try {
      const apiKey = await this.fetchSecureApiKey();
      
      // Dynamic script loading with secure key
      if (!window.google) {
        await this.loadMapsScript(apiKey);
      }
      
      this.isInitialized = true;
      console.log('✅ Secure Google Maps services initialized');
    } catch (error) {
      console.error('❌ Error loading secure Google Maps:', error);
      throw new Error(`Failed to load Google Maps securely: ${error}`);
    }
  }

  private loadMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps script loaded successfully');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Google Maps script:', error);
        reject(new Error('Failed to load Google Maps script'));
      };
      
      document.head.appendChild(script);
    });
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported');
        reject(new Error('Geolocation not supported'));
        return;
      }

      console.log('📍 Getting current location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('✅ Location obtained:', location);
          resolve(location);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  async geocodeLocation(latLng: google.maps.LatLng): Promise<string> {
    await this.loadGoogleMaps();
    
    const geocoder = new window.google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });
  }

  getNavigationUrl(from: { lat: number; lng: number }, to: { lat: number; lng: number }): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
  }
}

export const secureGoogleMapsService = new SecureGoogleMapsService();
