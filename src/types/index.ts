/**
 * Coded by Gemini
 * 
 * src/types/index.ts
 * 
 * This file serves as the single source of truth for all data models
 * and type definitions across the Kigali Ride AWA application.
 * Based on the Lifuti PWA specification.
 */

// ==========
// ENUMS
// ==========

export enum UserRole {
  PASSENGER = 'passenger',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

export enum TripStatus {
  // Passenger Trip Statuses
  REQUESTED = 'requested',
  MATCHED = 'matched',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  // Driver Trip Statuses
  OPEN = 'open', 
}

export enum TripMatchStatus {
  PENDING = 'pending', // Driver offered, passenger has not accepted
  CONFIRMED = 'confirmed', // Passenger accepted
  CANCELLED_BY_PASSENGER = 'cancelled_by_passenger',
  CANCELLED_BY_DRIVER = 'cancelled_by_driver',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  DISPUTED = 'disputed',
}

export enum VehicleType {
  MOTO = 'moto',
  CAR = 'car',
  TUKTUK = 'tuktuk',
  MINIBUS = 'minibus',
}


// ==========
// DATABASE TABLE INTERFACES
// ==========

// Corresponds to the 'users' table
export interface UserProfile {
  id: string; // UUID from auth.users
  created_at: string;
  updated_at: string;
  phone_number?: string;
  phone_verified: boolean;
  full_name?: string;
  avatar_url?: string;
  role: UserRole | null;
  onboarding_completed: boolean;
  is_suspended: boolean;
  last_seen?: string;
  // Supabase anonymous auth UID, if applicable
  anonymous_auth_uid?: string;
}

// Corresponds to the 'drivers' table (profile information)
export interface DriverProfile {
  user_id: string; // Foreign key to users.id
  is_available: boolean; // The 'online/offline' toggle
  active_vehicle_id?: string; // Foreign key to driver_vehicles.id
  rating: number; // Average rating
  total_trips: number;
  updated_at: string;
}

// Corresponds to the 'driver_vehicles' table
export interface DriverVehicle {
  id: string;
  driver_id: string; // Foreign key to users.id
  vehicle_type: VehicleType;
  license_plate: string;
  model: string;
  color: string;
  year?: number;
  is_verified: boolean;
}

// Corresponds to the 'passenger_trips' table (ride requests)
export interface PassengerTrip {
  id: string;
  passenger_id: string;
  from_address: string;
  to_address: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  requested_departure_time: string;
  vehicle_type: VehicleType | 'any';
  status: TripStatus;
  created_at: string;
  expires_at: string;
}

// Corresponds to the 'driver_trips' table (scheduled rides)
export interface DriverTrip {
  id: string;
  driver_id: string;
  vehicle_id: string;
  from_address: string;
  to_address: string;
  from_lat: number;
  from_lng: number;
  to_lat: number;
  to_lng: number;
  scheduled_departure_time: string;
  available_seats: number;
  fare_per_seat: number;
  status: TripStatus;
  created_at: string;
}

// Corresponds to the 'trip_matches' table
export interface TripMatch {
  id: string;
  passenger_trip_id: string;
  driver_trip_id?: string; // Can be null if driver makes a direct offer
  driver_id: string;
  status: TripMatchStatus;
  negotiated_fare?: number;
  payment_status: PaymentStatus;
  chat_opened_at?: string;
  created_at: string;
  updated_at: string;
}

// Corresponds to the 'user_status' table
export interface UserStatus {
  user_id: string;
  is_online: boolean;
  current_location?: { lat: number; lng: number };
  last_updated: string;
  status_message?: string; // e.g., "In-ride", "Looking for passengers"
}

// Corresponds to the 'loyalty_actions' table
export interface LoyaltyAction {
  id: string;
  user_id: string;
  action_type: 'ride_completed' | 'referral_success' | 'share_app' | 'contribution';
  points_awarded: number;
  related_trip_id?: string;
  related_user_id?: string;
  created_at: string;
}


// ==========
// UTILITY & API TYPES
// ==========

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

export type CombinedTrip = (PassengerTrip | DriverTrip) & {
  match?: TripMatch;
  driver?: UserProfile & DriverProfile & { vehicle: DriverVehicle };
  passenger?: UserProfile;
};

// ==========
// TEMPORARY HELPER API TYPES (until Supabase gen types is wired)
// ==========

// Standard envelope returned from Edge Functions
export interface EdgeFunctionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { message: string };
}

// Lightweight trip shape used by UI while schemas stabilise
export interface TripData {
  id: string;
  from_address: string;
  to_address: string;
  scheduled_departure_time: string;
  status: TripStatus;
}

// Driver-specific extension of TripData
export interface DriverTrip extends TripData {
  vehicle_type: VehicleType;
  available_seats: number;
  fare_per_seat: number;
} 