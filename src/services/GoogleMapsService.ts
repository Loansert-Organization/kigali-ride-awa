import { Loader } from '@googlemaps/js-api-loader';
import { config } from '@/config/environment';

class GoogleMapsService {
  private loader: Loader;
  private map: google.maps.Map | null = null;
  private markers: google.maps.Marker[] = [];
  private directionsService: google.maps.DirectionsService | null = null;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  constructor() {
    this.loader = new Loader({
      apiKey: config.googleMaps.apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  async loadGoogleMaps(): Promise<void> {
    try {
      await this.loader.load();
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#8b5cf6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw new Error('Failed to load Google Maps');
    }
  }

  async initializeMap(container: HTMLElement, options: google.maps.MapOptions): Promise<google.maps.Map> {
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

    this.map = new google.maps.Map(container, { ...defaultOptions, ...options });
    
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(this.map);
    }

    this.placesService = new google.maps.places.PlacesService(this.map);
    
    return this.map;
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
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
    const geocoder = new google.maps.Geocoder();
    
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
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    };

    const marker = new google.maps.Marker({
      position: { lat: driver.lat, lng: driver.lng },
      map: this.map,
      icon: icon,
      title: `${driver.vehicle_type} Driver`,
      animation: google.maps.Animation.DROP
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
        travelMode: google.maps.TravelMode.DRIVING
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
