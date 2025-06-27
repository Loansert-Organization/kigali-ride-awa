import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { BookingProvider } from '@/contexts/BookingContext';
import { ToastProvider } from '@/components/ui/toast';

// Create a new query client for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

interface AllProvidersProps {
  children: React.ReactNode;
}

// All providers wrapper
const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <BookingProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </BookingProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockUser = {
  id: 'test-user-123',
  phone_number: '+250788123456',
  role: 'passenger' as const,
  onboarding_completed: true,
  phone_verified: true,
  auth_method: 'whatsapp',
  promo_code: 'RIDE-ABC123',
  language: 'en',
  location_enabled: true,
  notifications_enabled: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockTrip = {
  id: 'trip-123',
  driver_id: 'driver-123',
  origin: 'Kigali City Center',
  destination: 'Kimironko Market',
  origin_latitude: -1.9536,
  origin_longitude: 30.0606,
  destination_latitude: -1.9498,
  destination_longitude: 30.1347,
  departure_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  available_seats: 3,
  fare: 2500,
  status: 'active' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockDriverProfile = {
  id: 'driver-profile-123',
  user_id: 'driver-123',
  vehicle_type: 'sedan',
  plate_number: 'RAB 123C',
  preferred_zone: 'Kigali',
  is_online: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}; 