import { Loader } from '@googlemaps/js-api-loader';
import { config } from '@/config/environment';

class GoogleMapsService {
  private static instance: GoogleMapsService;
  private loader: Loader;
  private map?: google.maps.Map;
  private directionsService?: google.maps.DirectionsService;
  private directionsRenderer?: google.maps.DirectionsRenderer;
  private isLoaded = false;
  private isLoading = false;

  private constructor() {
    this.loader = new Loader({
      apiKey: config.googleMaps.apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry', 'drawing'],
      language: 'en',
      region: 'RW', // Rwanda region for better local results
    });
  }

  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  public async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    if (this.isLoading) {
      // Wait for the current loading to complete
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    
    try {
      if (!window.google?.maps) {
        await this.loadGoogleMapsScript();
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Failed to load Google Maps:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  private async loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });
  }

  public async initializeMap(
    mapContainer: HTMLElement,
    options: google.maps.MapOptions
  ): Promise<google.maps.Map> {
    try {
      await this.ensureLoaded();
      this.map = new google.maps.Map(mapContainer, options);
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer();
      this.directionsRenderer.setMap(this.map);
      return this.map;
    } catch (e) {
      console.error("Failed to load Google Maps script. Please check your API key, billing status, and API restrictions in the Google Cloud Console.", e);
      throw e;
    }
  }
  
  public async getAutocompleteService(): Promise<google.maps.places.AutocompleteService> {
    await this.ensureLoaded();
    return new google.maps.places.AutocompleteService();
  }

  public async getPlacesService(mapInstance?: google.maps.Map): Promise<google.maps.places.PlacesService> {
    await this.ensureLoaded();
    const targetMap = mapInstance || this.map;
    if (!targetMap) {
      // Create a temporary map for places service
      const tempDiv = document.createElement('div');
      const tempMap = new google.maps.Map(tempDiv, {
        center: { lat: 0, lng: 0 },
        zoom: 1
      });
      return new google.maps.places.PlacesService(tempMap);
    }
    return new google.maps.places.PlacesService(targetMap);
  }

  public async geocode(request: google.maps.GeocoderRequest): Promise<google.maps.GeocoderResult[]> {
    await this.ensureLoaded();
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode(request, (results, status) => {
        if (status === 'OK' && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocode failed: ${status}`));
        }
      });
    });
  }

  public async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      });
    });
  }
  
  public async displayRoute(request: google.maps.DirectionsRequest) {
    if (!this.directionsService || !this.directionsRenderer) {
      throw new Error('Directions service not initialized.');
    }
    this.directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        this.directionsRenderer?.setDirections(result);
      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });
  }

  public async calculateAndDisplayRoute(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral) {
    // Temporary stub – real implementation will draw polyline on map
    console.debug('calculateAndDisplayRoute STUB', origin, destination);
  }

  public getNavigationUrl(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral): string {
    // Stubbed Deep-Link to Google Maps
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  }

  // Convenience alias expected by some legacy code
  public async geocodeLocation(address: string) {
    return this.geocode({ address });
  }

  public async getCurrentLocation() {
    return this.getCurrentPosition();
  }

  async calculateRoute(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral,
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ): Promise<google.maps.DirectionsResult> {
    await this.ensureLoaded();
    const directionsService = new google.maps.DirectionsService();
    
    return new Promise((resolve, reject) => {
      directionsService.route({
        origin,
        destination,
        travelMode,
        avoidHighways: false,
        avoidTolls: false,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          resolve(result);
        } else {
          reject(new Error(`Route calculation failed: ${status}`));
        }
      });
    });
  }

  // Country-specific autocomplete requests
  async getCountryAutocomplete(
    input: string,
    countryCode: string,
    center?: google.maps.LatLngLiteral,
    radius?: number
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    const service = await this.getAutocompleteService();
    
    const request: google.maps.places.AutocompletionRequest = {
      input,
      componentRestrictions: { country: countryCode.toLowerCase() },
      types: ['establishment', 'geocode'],
    };

    // Add location bias if provided
    if (center) {
      request.location = new google.maps.LatLng(center.lat, center.lng);
      request.radius = radius || 100000; // 100km default
    }

    return new Promise((resolve, reject) => {
      service.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          resolve([]); // Return empty array instead of rejecting
        }
      });
    });
  }

  // Distance calculation helper
  calculateDistance(
    point1: google.maps.LatLngLiteral,
    point2: google.maps.LatLngLiteral
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const googleMapsService = GoogleMapsService.getInstance();
