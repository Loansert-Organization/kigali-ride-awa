
export interface LocationHelpers {
  apiKey: string;
  getCurrentLocation: () => Promise<{ lat: number; lng: number }>;
  geocodeLocation: (address: string) => Promise<{ lat: number; lng: number }>;
}

export const createLocationHelpers = (apiKey: string): LocationHelpers => {
  return {
    apiKey,
    getCurrentLocation: async () => {
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
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      });
    },
    geocodeLocation: async (address: string) => {
      // Simulate geocoding - in real implementation, use Google Maps Geocoding API
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            lat: -1.9441 + (Math.random() - 0.5) * 0.1,
            lng: 30.0619 + (Math.random() - 0.5) * 0.1
          });
        }, 1000);
      });
    }
  };
};
