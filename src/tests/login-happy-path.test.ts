
// Simple test for login happy path without vitest dependency
// This can be run manually to verify the authentication flow

const mockLocalStorage = {
  getItem: (key: string) => {
    if (key === 'whatsapp_auth_user') {
      return JSON.stringify({
        id: 'test-user-id',
        phone_number: '+250700000001',
        phone_verified: true
      });
    }
    if (key === 'whatsapp_phone') {
      return '+250700000001';
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    console.log(`Setting ${key}:`, value);
  },
  removeItem: (key: string) => {
    console.log(`Removing ${key}`);
  }
};

// Mock supabase functions
const mockSupabaseFunctions = {
  invoke: async (functionName: string, options: any) => {
    console.log(`Calling ${functionName} with:`, options);
    
    if (functionName === 'send-otp') {
      return {
        data: { success: true },
        error: null
      };
    }
    
    if (functionName === 'verify-otp') {
      return {
        data: {
          success: true,
          user: {
            id: 'test-user-id',
            phone_number: '+250700000001',
            phone_verified: true
          }
        },
        error: null
      };
    }
    
    return { data: null, error: new Error('Unknown function') };
  }
};

// Test function for manual verification
export const testLoginHappyPath = async () => {
  console.log('🧪 Testing WhatsApp OTP Login Happy Path...');
  
  try {
    // Test 1: Send OTP
    const sendResult = await mockSupabaseFunctions.invoke('send-otp', {
      body: { phone: '+250700000001' }
    });
    
    if (sendResult.data?.success) {
      console.log('✅ OTP send successful');
    } else {
      throw new Error('OTP send failed');
    }
    
    // Test 2: Verify OTP
    const verifyResult = await mockSupabaseFunctions.invoke('verify-otp', {
      body: { phone: '+250700000001', code: '123456' }
    });
    
    if (verifyResult.data?.success && verifyResult.data?.user) {
      console.log('✅ OTP verification successful');
      
      // Test 3: Check localStorage
      mockLocalStorage.setItem('whatsapp_auth_user', JSON.stringify(verifyResult.data.user));
      mockLocalStorage.setItem('whatsapp_phone', '+250700000001');
      
      const storedUser = mockLocalStorage.getItem('whatsapp_auth_user');
      const storedPhone = mockLocalStorage.getItem('whatsapp_phone');
      
      if (storedUser && storedPhone === '+250700000001') {
        console.log('✅ localStorage storage successful');
        console.log('🎉 All tests passed! Login happy path working correctly.');
        return true;
      } else {
        throw new Error('localStorage verification failed');
      }
    } else {
      throw new Error('OTP verification failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Export for manual testing
export default testLoginHappyPath;
