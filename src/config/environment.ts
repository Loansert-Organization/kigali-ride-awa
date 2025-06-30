// Environment configuration for the application
export const config = {
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw'
  },
  googleOAuth: {
    clientId: '378544894308-56vi69m88k8cc29b4fikf7g8a93fhoap.apps.googleusercontent.com'
  },
  supabase: {
    url: 'https://ldbzarwjnnsoyoengheg.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkYnphcndqbm5zb3lvZW5naGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA4OTIsImV4cCI6MjA2NjQ0Njg5Mn0.iN-Viuf5Vg07aGyAnGgqW3DKFUcqxn8U2KAUeAMk9uY'
  },
  app: {
    name: 'Kigali Ride',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development'
  }
};

// Export individual configs for easier imports
export const { googleMaps, googleOAuth, supabase, app } = config;

export const OPENAI_PROXY = import.meta.env.VITE_OPENAI_PROXY || '/functions/v1/ai-trip-agent';
