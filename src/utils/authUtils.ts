export const isGuestMode = (userProfile: any): boolean => {
  return userProfile && !userProfile.auth_user_id && userProfile.id?.startsWith('guest_');
};

export const requiresAuth = (userProfile: any): boolean => {
  return isGuestMode(userProfile);
};

export const getDisplayName = (userProfile: any): string => {
  if (isGuestMode(userProfile)) {
    return 'Guest User';
  }
  return userProfile?.promo_code || 'User';
};

export const canAccessFeature = (userProfile: any, feature: 'booking' | 'history' | 'rewards'): boolean => {
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
