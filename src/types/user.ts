
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

// Additional types for comprehensive system support
export interface TripData {
  id: string;
  user_id: string;
  role: 'passenger' | 'driver';
  from_location: string;
  from_lat?: number;
  from_lng?: number;
  to_location: string;
  to_lat?: number;
  to_lng?: number;
  vehicle_type: string;
  scheduled_time: string;
  fare?: number;
  is_negotiable: boolean;
  seats_available: number;
  description?: string;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface BookingData {
  id: string;
  passenger_trip_id: string;
  driver_trip_id: string;
  confirmed: boolean;
  whatsapp_launched: boolean;
  created_at: string;
  updated_at: string;
}

export interface FavoriteLocation {
  id: string;
  user_id: string;
  label: string;
  address: string;
  lat?: number;
  lng?: number;
  created_at: string;
  updated_at: string;
}

export interface UserReferral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referee_role: 'passenger' | 'driver';
  points_awarded: number;
  validation_status: 'pending' | 'validated' | 'rejected';
  reward_week?: string;
  created_at: string;
  updated_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  week: string;
  points: number;
  reward_issued: boolean;
  reward_type?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentReport {
  id: string;
  user_id: string;
  trip_id?: string;
  type: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface TripHeatmapLog {
  id: string;
  trip_id?: string;
  lat: number;
  lng: number;
  role: 'passenger' | 'driver';
  created_at: string;
}

export interface AdminTripFlag {
  id: string;
  trip_id: string;
  admin_user_id: string;
  flag_reason: string;
  flag_type: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}
