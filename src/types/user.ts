
export interface UserProfile {
  id: string;
  auth_user_id: string | null;
  role: 'passenger' | 'driver' | null;
  language: string;
  location_enabled: boolean;
  notifications_enabled: boolean;
  promo_code: string;
  referred_by: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  vehicle_type: string;
  plate_number: string;
  is_online: boolean;
  preferred_zone: string | null;
  created_at: string;
  updated_at: string;
}

export interface PassengerProfile extends UserProfile {
  role: 'passenger';
}

export interface DriverUserProfile extends UserProfile {
  role: 'driver';
}
