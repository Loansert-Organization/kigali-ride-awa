import { UserProfile } from '../types/user';

export const isGuestMode = (userProfile: UserProfile | null): boolean => {
  return !userProfile || userProfile.auth_method === 'guest';
};

export const requiresAuth = (userProfile: UserProfile | null): boolean => {
  return !userProfile || userProfile.auth_method === 'guest';
};

export const getDisplayName = (userProfile: UserProfile | null): string => {
  if (!userProfile) return 'Guest';
  if (userProfile.auth_method === 'guest') return 'Guest';
  return userProfile.phone_number || userProfile.id?.substring(0, 8) || 'User';
};

export const canAccessFeature = (userProfile: UserProfile | null, feature: 'booking' | 'history' | 'rewards'): boolean => {
  if (!userProfile) return false;
  
  // Guest users can browse but have limited booking capabilities
  if (isGuestMode(userProfile)) {
    return feature === 'booking'; // Allow basic booking flow
  }
  
  return true; // Authenticated users can access all features
};

export const generatePromoCode = (): string => {
  const prefix = 'GUEST-';
  const suffix = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `${prefix}${suffix}`;
};

export const isWhatsAppVerified = (userProfile: UserProfile | null): boolean => {
  return !!userProfile && userProfile.phone_verified;
};

export const getAuthStatusText = (userProfile: UserProfile | null): string => {
  if (!userProfile) return 'Not authenticated';
  
  if (isWhatsAppVerified(userProfile)) {
    return 'WhatsApp verified';
  }
  
  if (userProfile.auth_user_id) {
    return 'Authenticated';
  }
  
  return 'Guest mode';
};

export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};
