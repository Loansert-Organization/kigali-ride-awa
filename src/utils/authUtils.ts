
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
