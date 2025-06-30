
import { Loader } from '@googlemaps/js-api-loader';

class GoogleMapsService {
  private loader: Loader;
  private apiKey: string;

  constructor() {
    this.apiKey = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';
    this.loader = new Loader({
      apiKey: this.apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });
  }

  async initializeMap(element: HTMLElement, options: google.maps.MapOptions): Promise<google.maps.Map> {
    const { Map } = await this.loader.importLibrary('maps') as google.maps.MapsLibrary;
    return new Map(element, options);
  }

  async getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  async geocodeLocation(latLng: google.maps.LatLng): Promise<string> {
    const { Geocoder } = await this.loader.importLibrary('geocoding') as google.maps.GeocodingLibrary;
    const geocoder = new Geocoder();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error('Geocoding failed: ' + status));
        }
      });
    });
  }

  async calculateAndDisplayRoute(
    start: google.maps.LatLng,
    end: google.maps.LatLng,
    map?: google.maps.Map
  ): Promise<google.maps.DirectionsResult> {
    const { DirectionsService, DirectionsRenderer } = await this.loader.importLibrary('routes') as google.maps.RoutesLibrary;
    
    const directionsService = new DirectionsService();
    const directionsRenderer = new DirectionsRenderer();

    if (map) {
      directionsRenderer.setMap(map);
    }

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === 'OK' && result) {
            directionsRenderer.setDirections(result);
            resolve(result);
          } else {
            reject(new Error('Directions request failed: ' + status));
          }
        }
      );
    });
  }

  getNavigationUrl(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number }
  ): string {
    return `https://www.google.com/maps/dir/${from.lat},${from.lng}/${to.lat},${to.lng}`;
  }
}

export const googleMapsService = new GoogleMapsService();
export default googleMapsService;
