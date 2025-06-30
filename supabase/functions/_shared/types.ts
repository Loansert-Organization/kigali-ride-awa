// Shared type definitions for Supabase Edge Functions

// Removed runtime import of '@supabase/supabase-js' to avoid bundle errors in Edge Functions.
// If you need Supabase client types at build time, install dev types and import only in non-edge code.

// Base types
export interface EdgeFunctionRequest {
  headers: Headers;
  method: string;
  url: string;
  body?: unknown;
}

export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

// Database types
export interface UserProfile {
  id: string;
  full_name?: string;
  phone_number?: string;
  email?: string;
  role?: 'passenger' | 'driver' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface PassengerTrip {
  id: string;
  passenger_id: string;
  from_location: string;
  to_location: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  scheduled_time: string;
  status: 'requested' | 'matched' | 'completed' | 'cancelled';
  fare?: number;
  created_at: string;
  updated_at: string;
}

export interface DriverTrip {
  id: string;
  driver_id: string;
  from_location: string;
  to_location: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  scheduled_time: string;
  available_seats: number;
  fare_per_seat: number;
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TripMatch {
  id: string;
  passenger_trip_id: string;
  driver_trip_id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  match_score: number;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed' | 'expired';
  referred_user_trips?: number;
  bonus_paid: boolean;
  created_at: string;
  updated_at: string;
}

// AI Context types
export interface AIContext {
  userInfo?: {
    id: string;
    role: string;
    preferences?: Record<string, unknown>;
  };
  requestType: string;
  additionalData?: Record<string, unknown>;
}

// Queue types
export interface QueuePayload {
  phoneNumber?: string;
  otp?: string;
  message?: string;
  tripId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

// Error types
export interface ErrorReport {
  error_type: string;
  error_message: string;
  stack_trace?: string;
  user_id?: string;
  endpoint?: string;
  request_data?: Record<string, unknown>;
  session_data?: Record<string, unknown>;
  timestamp: string;
}

// Notification types
export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

// Type guards
export function isPassengerTrip(obj: unknown): obj is PassengerTrip {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'passenger_id' in obj &&
    'from_location' in obj &&
    'to_location' in obj
  );
}

export function isDriverTrip(obj: unknown): obj is DriverTrip {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'driver_id' in obj &&
    'available_seats' in obj &&
    'fare_per_seat' in obj
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Supabase client type (placeholder – avoids runtime import)
export type TypedSupabaseClient = unknown;

// Database schema types (simplified)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Partial<UserProfile>;
        Update: Partial<UserProfile>;
      };
      passenger_trips: {
        Row: PassengerTrip;
        Insert: Partial<PassengerTrip>;
        Update: Partial<PassengerTrip>;
      };
      driver_trips: {
        Row: DriverTrip;
        Insert: Partial<DriverTrip>;
        Update: Partial<DriverTrip>;
      };
      trip_matches: {
        Row: TripMatch;
        Insert: Partial<TripMatch>;
        Update: Partial<TripMatch>;
      };
      referrals: {
        Row: Referral;
        Insert: Partial<Referral>;
        Update: Partial<Referral>;
      };
    };
  };
} 