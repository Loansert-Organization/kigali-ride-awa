
// Environment configuration for the Kigali Ride platform
export const config = {
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCePJuN1t2y41ra4FSJHDSbnixMxGotrYU',
  },
  supabase: {
    url: 'https://ldbzarwjnnsoyoengheg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnphcndqbm5zb3lvZW5naGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA4OTIsImV4cCI6MjA2NjQ0Njg5Mn0.iN-Viuf5Vg07aGyAnGgqW3DKFUcqxn8U2KAUeAMk9uY',
  }
};

// Enhanced validation with more detailed logging
if (!config.googleMaps.apiKey || config.googleMaps.apiKey === '') {
  console.warn('⚠️ Google Maps API key is missing. Map features may not work properly.');
} else {
  console.log('✅ Google Maps API key loaded successfully');
}

// Supabase is now hardcoded and always available
console.log('✅ Supabase configuration loaded successfully');

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('🔍 Environment Debug Info:', {
    googleMapsApiKey: config.googleMaps.apiKey ? `${config.googleMaps.apiKey.substring(0, 10)}...` : 'MISSING',
    supabaseUrl: config.supabase.url ? `${config.supabase.url.substring(0, 20)}...` : 'MISSING',
    supabaseAnonKey: config.supabase.anonKey ? `${config.supabase.anonKey.substring(0, 20)}...` : 'MISSING'
  });
}
