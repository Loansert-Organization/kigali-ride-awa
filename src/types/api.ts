// API and data type definitions for Kigali Ride AWA

import { UserProfile } from './user';

// Supabase function response types
export interface SupabaseResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  success?: boolean;
}

// Edge function specific types
export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WhatsApp OTP types
export interface WhatsAppOTPResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

// Trip related types
export interface TripData {
  id: string;
  user_id: string;
  created_at: string;
  from_location: string;
  to_location: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  scheduled_time: string;
  seats_available: number;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  fare?: number;
  vehicle_type?: string;
  description?: string;
  is_negotiable?: boolean;
  passenger_name?: string;
  passenger_phone?: string;
}

// Driver profile types
export interface DriverProfile {
  id: string;
  user_id: string;
  vehicle_type?: string;
  vehicle_number?: string;
  vehicle_color?: string;
  total_trips?: number;
  average_rating?: number;
  is_online?: boolean;
  created_at: string;
  updated_at: string;
}

// Booking types
export interface BookingData {
  id: string;
  trip_id: string;
  passenger_id: string;
  seats_booked: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  pickup_location?: string;
  dropoff_location?: string;
  created_at: string;
  updated_at: string;
}

// Search results types
export interface SearchMetadata {
  role?: string;
  trips?: number;
  fare?: number;
  timestamp?: string;
  [key: string]: unknown;
}

// Form submission types
export interface FormSubmitEvent extends React.FormEvent<HTMLFormElement> {
  preventDefault: () => void;
}

// Google Maps types
export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

// Performance metrics
export interface PerformanceMetric {
  avg: number;
  latest: number;
  count: number;
  min?: number;
  max?: number;
}

// Edge function status
export interface EdgeFunctionStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  responseTime: number;
  lastChecked?: string;
}

// Admin dashboard types
export interface DashboardStats {
  totalUsers: number;
  activeTrips: number;
  totalRevenue: number;
  systemHealth: number;
}

// Notification types
export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

// Referral types
export interface ReferralData {
  id: string;
  referrer_id: string;
  referred_id?: string;
  code: string;
  status: 'pending' | 'completed';
  created_at: string;
} 