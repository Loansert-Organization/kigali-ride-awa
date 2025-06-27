import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BookingProvider, useBookingContext } from '../BookingContext';
import React from 'react';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BookingProvider>{children}</BookingProvider>
);

describe('BookingContext', () => {
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      expect(result.current.state).toEqual({
        origin: '',
        destination: '',
        date: expect.any(String),
        time: expect.any(String),
        isImmediate: true,
        vehicleType: 'sedan',
        seats: 1,
        paymentMethod: 'cash',
        status: 'idle',
        currentStep: 0,
        isLoading: false,
      });
    });
  });

  describe('Location Actions', () => {
    it('should set locations', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setLocations({
          origin: 'Kigali City Center',
          destination: 'Kimironko Market',
          originLocation: { lat: -1.9536, lng: 30.0606 },
          destinationLocation: { lat: -1.9498, lng: 30.1347 },
        });
      });

      expect(result.current.state.origin).toBe('Kigali City Center');
      expect(result.current.state.destination).toBe('Kimironko Market');
      expect(result.current.state.originLocation).toEqual({ lat: -1.9536, lng: 30.0606 });
      expect(result.current.state.destinationLocation).toEqual({ lat: -1.9498, lng: 30.1347 });
    });
  });

  describe('Timing Actions', () => {
    it('should set timing information', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setTiming({
          date: '2024-12-25',
          time: '14:30',
          isImmediate: false,
        });
      });

      expect(result.current.state.date).toBe('2024-12-25');
      expect(result.current.state.time).toBe('14:30');
      expect(result.current.state.isImmediate).toBe(false);
    });
  });

  describe('Vehicle Actions', () => {
    it('should set vehicle preferences', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setVehicle({
          vehicleType: 'suv',
          seats: 3,
        });
      });

      expect(result.current.state.vehicleType).toBe('suv');
      expect(result.current.state.seats).toBe(3);
    });
  });

  describe('Payment Actions', () => {
    it('should set payment information', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setPayment({
          paymentMethod: 'mobile_money',
          estimatedFare: 3500,
        });
      });

      expect(result.current.state.paymentMethod).toBe('mobile_money');
      expect(result.current.state.estimatedFare).toBe(3500);
    });
  });

  describe('Status Management', () => {
    it('should update booking status', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setStatus('searching');
      });

      expect(result.current.state.status).toBe('searching');
    });

    it('should clear error when cancelling', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setError('Network error');
        result.current.actions.setStatus('cancelled');
      });

      expect(result.current.state.error).toBeUndefined();
    });
  });

  describe('Trip Matching', () => {
    it('should set matched trip', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      const mockTrip = {
        id: 'trip-123',
        driver_id: 'driver-123',
        origin: 'A',
        destination: 'B',
        departure_time: '2024-12-25T14:00:00Z',
        available_seats: 3,
        fare: 2500,
        status: 'active' as const,
        created_at: '2024-12-25T12:00:00Z',
        updated_at: '2024-12-25T12:00:00Z',
      };

      act(() => {
        result.current.actions.setMatchedTrip(mockTrip);
      });

      expect(result.current.state.matchedTrip).toEqual(mockTrip);
      expect(result.current.state.status).toBe('matched');
    });
  });

  describe('Step Navigation', () => {
    it('should navigate to next step', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.nextStep();
      });

      expect(result.current.state.currentStep).toBe(1);
    });

    it('should navigate to previous step', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.nextStep();
        result.current.actions.nextStep();
        result.current.actions.previousStep();
      });

      expect(result.current.state.currentStep).toBe(1);
    });

    it('should not go beyond max steps', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        // Try to go beyond step 4
        for (let i = 0; i < 10; i++) {
          result.current.actions.nextStep();
        }
      });

      expect(result.current.state.currentStep).toBe(4);
    });

    it('should not go below step 0', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.previousStep();
        result.current.actions.previousStep();
      });

      expect(result.current.state.currentStep).toBe(0);
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setLoading(true);
      });

      expect(result.current.state.isLoading).toBe(true);
    });

    it('should set error and clear loading', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      act(() => {
        result.current.actions.setLoading(true);
        result.current.actions.setError('Something went wrong');
      });

      expect(result.current.state.error).toBe('Something went wrong');
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  describe('Reset Action', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useBookingContext(), { wrapper });

      // Make multiple changes
      act(() => {
        result.current.actions.setLocations({
          origin: 'Test Origin',
          destination: 'Test Destination',
        });
        result.current.actions.setVehicle({
          vehicleType: 'minivan',
          seats: 5,
        });
        result.current.actions.nextStep();
        result.current.actions.setLoading(true);
      });

      // Reset
      act(() => {
        result.current.actions.reset();
      });

      expect(result.current.state.origin).toBe('');
      expect(result.current.state.destination).toBe('');
      expect(result.current.state.vehicleType).toBe('sedan');
      expect(result.current.state.seats).toBe(1);
      expect(result.current.state.currentStep).toBe(0);
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw error when used outside provider', () => {
      // This will throw an error
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useBookingContext());
      }).toThrow('useBookingContext must be used within a BookingProvider');

      consoleError.mockRestore();
    });
  });
}); 