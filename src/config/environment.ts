
// Environment configuration for the Kigali Ride platform
export const config = {
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }
};

// Validation
if (!config.googleMaps.apiKey) {
  console.warn('Google Maps API key is missing. Map features may not work properly.');
}

if (!config.supabase.url || !config.supabase.anonKey) {
  console.warn('Supabase configuration is missing.');
}
