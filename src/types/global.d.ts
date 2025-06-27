// Global type definitions for Kigali Ride AWA

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  status?: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: AppError;
  success: boolean;
}

// Common function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type ErrorHandler = (error: Error | AppError) => void;
export type VoidFunction = () => void;

// Form types
export type FormData = Record<string, unknown>;
export type FormErrors = Record<string, string>;

// Replace 'any' with these specific types
export type UnknownObject = Record<string, unknown>;
export type UnknownArray = unknown[];
export type UnknownFunction = (...args: unknown[]) => unknown;

// Supabase specific types
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// User types
export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  role: 'passenger' | 'driver' | 'admin';
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// Trip types
export interface Trip {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  fare: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

// Location types
export interface Location {
  lat: number;
  lng: number;
  address?: string;
  place_id?: string;
}

// Google Maps types extension
declare global {
  interface Window {
    google?: typeof google;
    initMap?: () => void;
  }
} 