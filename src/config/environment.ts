
// Environment configuration for the Kigali Ride platform
export const config = {
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCePJuN1t2y41ra4FSJHDSbnixMxGotrYU',
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  }
};

// Enhanced validation with more detailed logging
if (!config.googleMaps.apiKey || config.googleMaps.apiKey === '') {
  console.error('❌ Google Maps API key is missing. Map features will not work.');
  console.log('🔧 Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables');
} else {
  console.log('✅ Google Maps API key loaded successfully');
}

if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('❌ Supabase configuration is missing.');
} else {
  console.log('✅ Supabase configuration loaded successfully');
}

// Debug logging for development
if (import.meta.env.DEV) {
  console.log('🔍 Environment Debug Info:', {
    googleMapsApiKey: config.googleMaps.apiKey ? `${config.googleMaps.apiKey.substring(0, 10)}...` : 'MISSING',
    supabaseUrl: config.supabase.url ? `${config.supabase.url.substring(0, 20)}...` : 'MISSING',
    supabaseAnonKey: config.supabase.anonKey ? `${config.supabase.anonKey.substring(0, 20)}...` : 'MISSING'
  });
}
