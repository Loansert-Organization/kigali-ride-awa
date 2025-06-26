
import { describe, it, expect, vi } from 'vitest';

// Mock the supabase client
const mockInvoke = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke
    }
  }
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('Login Happy Path', () => {
  it('should successfully authenticate with WhatsApp OTP', async () => {
    // Mock successful OTP send
    mockInvoke.mockResolvedValueOnce({
      data: { success: true },
      error: null
    });

    // Mock successful OTP verification
    mockInvoke.mockResolvedValueOnce({
      data: { 
        success: true, 
        user: { 
          id: 'test-user-id',
          phone_number: '+250700000001',
          phone_verified: true 
        } 
      },
      error: null
    });

    // Import the hook after mocking
    const { useUnifiedAuth } = await import('@/hooks/useUnifiedAuth');
    
    // Test the hook
    const { sendOTP, verifyOTP } = useUnifiedAuth();

    // Test OTP send
    const sendResult = await sendOTP('+250700000001');
    expect(sendResult.success).toBe(true);
    expect(mockInvoke).toHaveBeenCalledWith('send-otp', {
      body: { phone: '+250700000001' }
    });

    // Test OTP verification
    const verifyResult = await verifyOTP('+250700000001', '123456');
    expect(verifyResult.success).toBe(true);
    expect(verifyResult.user).toBeDefined();
    expect(mockInvoke).toHaveBeenCalledWith('verify-otp', {
      body: { phone: '+250700000001', code: '123456' }
    });

    // Verify localStorage was updated
    const storedUser = localStorage.getItem('whatsapp_auth_user');
    expect(storedUser).toBeTruthy();
    
    const storedPhone = localStorage.getItem('whatsapp_phone');
    expect(storedPhone).toBe('+250700000001');
  });
});
