import { config } from '@/config/environment';

// Temporary export to fix build issue
export const googleMapsService = {
  // This is a placeholder - the actual implementation seems to have been removed
  // Using config.googleMaps for now
  apiKey: config.googleMaps.apiKey,
};

export default googleMapsService;
