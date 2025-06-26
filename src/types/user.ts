
export interface UserProfile {
  id: string;
  phone_number?: string;
  role: 'passenger' | 'driver' | null;
  onboarding_completed: boolean;
  phone_verified: boolean;
  auth_method: string;
  promo_code: string;
  language: string;
  location_enabled: boolean;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  vehicle_type: string;
  plate_number: string;
  preferred_zone?: string | null;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}
