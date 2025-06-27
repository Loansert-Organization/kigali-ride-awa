// Type definitions for React hooks

import { UserProfile } from './user';
import { TripData, BookingData, DriverProfile } from './api';

// Authentication hook types
export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// Common hook return types
export interface UseLoadingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Form hook types
export interface FormErrors {
  [field: string]: string;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  loading: boolean;
  handleChange: (field: keyof T, value: unknown) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
}

// Trip related hook types
export interface UseTripReturn {
  trips: TripData[];
  loading: boolean;
  error: string | null;
  createTrip: (trip: Omit<TripData, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTrip: (id: string, updates: Partial<TripData>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

// Driver hook types
export interface UseDriverReturn {
  profile: DriverProfile | null;
  isOnline: boolean;
  loading: boolean;
  error: string | null;
  toggleOnlineStatus: () => Promise<void>;
  updateProfile: (updates: Partial<DriverProfile>) => Promise<void>;
}

// Booking hook types
export interface UseBookingReturn {
  bookings: BookingData[];
  loading: boolean;
  error: string | null;
  createBooking: (booking: Omit<BookingData, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  confirmBooking: (id: string) => Promise<void>;
}

// Modal hook types
export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Toast notification types
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

// Pagination hook types
export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
}

// Search hook types
export interface UseSearchReturn<T> {
  query: string;
  results: T[];
  loading: boolean;
  setQuery: (query: string) => void;
  clearSearch: () => void;
}

// Filter hook types
export interface FilterOptions {
  [key: string]: unknown;
}

export interface UseFilterReturn<T> {
  filters: FilterOptions;
  filteredData: T[];
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
  applyFilters: () => void;
} 