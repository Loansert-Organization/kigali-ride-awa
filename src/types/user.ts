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
  license_plate: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_number?: string;
  is_available: boolean;
  current_location?: { lat: number; lng: number };
  created_at: string;
  updated_at: string;
}
