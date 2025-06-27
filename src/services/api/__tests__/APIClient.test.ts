import { describe, it, expect, vi, beforeEach } from 'vitest';
import { APIClient } from '../APIClient';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { supabase } from '@/integrations/supabase/client';

describe('APIClient', () => {
  let apiClient: APIClient;

  beforeEach(() => {
    vi.clearAllMocks();
    apiClient = APIClient.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = APIClient.getInstance();
      const instance2 = APIClient.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Auth Methods', () => {
    it('should send OTP successfully', async () => {
      const mockResponse = { data: { messageId: 'msg-123' }, error: null };
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockResponse);

      const result = await apiClient.auth.sendOTP('+250788123456');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('send-otp', {
        body: { phone_number: '+250788123456' },
      });
      expect(result).toEqual({
        success: true,
        data: { messageId: 'msg-123' },
      });
    });

    it('should handle OTP sending error', async () => {
      const mockError = { 
        data: null, 
        error: { message: 'Network error', code: 'NETWORK_ERROR' } 
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockError);

      const result = await apiClient.auth.sendOTP('+250788123456');

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should verify OTP successfully', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-123', phone_number: '+250788123456' },
          session: { access_token: 'token-123' },
        },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockResponse);

      const result = await apiClient.auth.verifyOTP('+250788123456', '123456');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('verify-otp', {
        body: { phone_number: '+250788123456', otp_code: '123456' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Trip Methods', () => {
    it('should create trip successfully', async () => {
      const tripData = {
        origin: 'Kigali',
        destination: 'Huye',
        fare: 5000,
      };
      const mockResponse = {
        data: { id: 'trip-123', ...tripData },
        error: null,
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockResponse);

      const result = await apiClient.trips.create(tripData);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('create-trip', {
        body: tripData,
      });
      expect(result).toEqual({
        success: true,
        data: { id: 'trip-123', ...tripData },
      });
    });

    it('should get nearby trips', async () => {
      const location = { lat: -1.9536, lng: 30.0606 };
      const mockTrips = [
        { id: 'trip-1', origin: 'A', destination: 'B' },
        { id: 'trip-2', origin: 'C', destination: 'D' },
      ];
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: mockTrips,
        error: null,
      });

      const result = await apiClient.trips.getNearby(location, 10);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('get-nearby-open-trips', {
        body: { location, radius: 10 },
      });
      expect(result.data).toEqual(mockTrips);
    });

    it('should match trips', async () => {
      const mockMatch = {
        id: 'match-123',
        trip_id: 'trip-123',
        passenger_id: 'passenger-123',
        status: 'pending',
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { match: mockMatch },
        error: null,
      });

      const result = await apiClient.trips.match('passenger-trip-123', 'driver-trip-123');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('match-passenger-driver', {
        body: {
          action: 'match',
          passenger_trip_id: 'passenger-trip-123',
          driver_trip_id: 'driver-trip-123',
        },
      });
      expect(result.data?.match).toEqual(mockMatch);
    });
  });

  describe('Driver Methods', () => {
    it('should get live drivers', async () => {
      const bounds = { north: 1, south: -1, east: 31, west: 29 };
      const mockDrivers = [
        { id: 'driver-1', is_online: true },
        { id: 'driver-2', is_online: true },
      ];
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: mockDrivers,
        error: null,
      });

      const result = await apiClient.drivers.getLive(bounds);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('get-live-drivers', {
        body: { bounds },
      });
      expect(result.data).toEqual(mockDrivers);
    });

    it('should update driver status', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      const result = await apiClient.drivers.updateStatus('driver-123', true);

      expect(supabase.functions.invoke).toHaveBeenCalledWith('update-driver-status', {
        body: { driver_id: 'driver-123', is_online: true },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AI Methods', () => {
    it('should generate code', async () => {
      const mockResponse = {
        code: 'console.log("Hello");',
        explanation: 'This prints Hello',
      };
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: mockResponse,
        error: null,
      });

      const result = await apiClient.ai.generateCode('Print hello', 'JavaScript');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-generate-code', {
        body: { prompt: 'Print hello', context: 'JavaScript' },
      });
      expect(result.data).toEqual(mockResponse);
    });

    it('should localize text', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { translatedText: 'Bonjour' },
        error: null,
      });

      const result = await apiClient.ai.localize('Hello', 'fr');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-localize', {
        body: { text: 'Hello', target_language: 'fr' },
      });
      expect(result.data?.translatedText).toBe('Bonjour');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await apiClient.auth.sendOTP('+250788123456');

      expect(result).toEqual({
        success: false,
        error: 'Network error',
      });
    });

    it('should handle malformed responses', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await apiClient.trips.create({ origin: 'A', destination: 'B' });

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });
}); 