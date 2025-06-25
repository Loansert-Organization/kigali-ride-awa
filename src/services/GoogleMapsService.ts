import { Loader } from '@googlemaps/js-api-loader';
import { config } from '@/config/environment';

class GoogleMapsService {
  private loader: Loader;
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private directionsService: google.maps.DirectionsService | null = null;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private isInitialized: boolean = false;

  constructor() {
    console.log('🗺️ Initializing GoogleMapsService with API key:', config.googleMaps.apiKey ? 'Present' : 'Missing');
    
    if (!config.googleMaps.apiKey) {
      console.error('❌ Google Maps API key not found in config');
      throw new Error('Google Maps API key is required');
    }

    this.loader = new Loader({
      apiKey: config.googleMaps.apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  async loadGoogleMaps(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Google Maps already initialized');
      return;
    }

    try {
      console.log('🔄 Loading Google Maps API...');
      await this.loader.load();
      console.log('✅ Google Maps API loaded successfully');
      
      this.directionsService = new window.google.maps.DirectionsService();
      this.directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#8b5cf6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      this.isInitialized = true;
      console.log('✅ Google Maps services initialized');
    } catch (error) {
      console.error('❌ Error loading Google Maps:', error);
      throw new Error(`Failed to load Google Maps: ${error}`);
    }
  }

  async initializeMap(container: HTMLElement, options: google.maps.MapOptions): Promise<google.maps.Map> {
    console.log('🗺️ Initializing map container...');
    
    try {
      await this.loadGoogleMaps();
      
      const defaultOptions: google.maps.MapOptions = {
        center: { lat: -1.9441, lng: 30.0619 }, // Kigali
        zoom: 13,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }]
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#e6f3ff' }]
          }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      };

      this.map = new window.google.maps.Map(container, { ...defaultOptions, ...options });
      console.log('✅ Map created successfully');
      
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(this.map);
      }

      this.placesService = new window.google.maps.places.PlacesService(this.map);
      
      return this.map;
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      throw error;
    }
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

  addDriverMarker(driver: any): google.maps.Marker {
    if (!this.map) throw new Error('Map not initialized');

    const icon = {
      url: this.getVehicleIconUrl(driver.vehicle_type),
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20)
    };

    const marker = new window.google.maps.Marker({
      position: { lat: driver.lat, lng: driver.lng },
      map: this.map,
      icon: icon,
      title: `${driver.vehicle_type} Driver`,
      animation: window.google.maps.Animation.DROP
    });

    this.markers.push(marker);
    return marker;
  }

  private getVehicleIconUrl(vehicleType: string): string {
    const baseUrl = 'data:image/svg+xml;base64,';
    const icons = {
      moto: 'PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRjk1MDAiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiA2VjRtMCA2djEwbTgtOGgtMm0tNi0yaC0ydjJIOHYtMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPg==',
      car: 'PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xNCA5VjdtMCAwaDJtLTIgMGgtMm0wIDBINnY2aDEybS02LTZWNyIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPg==',
      tuktuk: 'PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM4QjVDRjYiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xMiA4VjZtMCAwaDJtLTIgMGgtMm0wIDBINnY4aDEybS02LThWNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPg==',
      minibus: 'PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMwNkI2RDQiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+CjxwYXRoIGQ9Ik0xNiAxMFY4bTAgMGgydjJtLTIgMGgtMnYybS0yIDBoLTJ2LTJINnY4aDEybS00LThWOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+Cjwvc3ZnPg=='
    };

    return baseUrl + (icons[vehicleType as keyof typeof icons] || icons.car);
  }

  clearMarkers(): void {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  calculateAndDisplayRoute(start: google.maps.LatLng, end: google.maps.LatLng): Promise<void> {
    if (!this.directionsService || !this.directionsRenderer) {
      throw new Error('Directions service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.directionsService!.route({
        origin: start,
        destination: end,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && result) {
          this.directionsRenderer!.setDirections(result);
          resolve();
        } else {
          reject(new Error('Directions request failed'));
        }
      });
    });
  }

  getNavigationUrl(from: { lat: number; lng: number }, to: { lat: number; lng: number }): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&travelmode=driving`;
  }
}

export const googleMapsService = new GoogleMapsService();
