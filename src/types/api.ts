
export interface TripData {
  id: string;
  user_id?: string;
  from_location?: string;
  to_location?: string;
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  scheduled_time?: string;
  vehicle_type?: string;
  seats_available?: number;
  fare?: number;
  is_negotiable?: boolean;
  status?: string;
  description?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Trip extends TripData {
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
  seats_available: number;
}

export interface TripDetails extends TripData {
  from_location: string;
  to_location: string;
  scheduled_time: string;
  vehicle_type: string;
}

export interface TripWithBooking extends TripData {
  bookings?: any[];
}

export interface PassengerRequest extends TripData {
  driver_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  passenger_count: number;
  max_fare: number;
}

export interface ReferralData {
  id: string;
  referrer_id: string;
  referee_id: string;
  referee_role: string;
  points_awarded: number;
  validation_status: string;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  user_id: string;
  vehicle_type: string;
  plate_number: string;
  is_online?: boolean;
  preferred_zone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  auth_user_id?: string;
  phone_number?: string;
  phone_verified?: boolean;
  role?: string;
  language?: string;
  promo_code?: string;
  location_enabled?: boolean;
  notifications_enabled?: boolean;
  onboarding_completed?: boolean;
  auth_method?: string;
  referred_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookingData {
  id: string;
  passenger_trip_id: string;
  driver_trip_id: string;
  confirmed?: boolean;
  whatsapp_launched?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EdgeFunctionResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}
