# Component Implementation Guide

## PhoneInputOTP Component

### Overview
A comprehensive phone number input component with international support and OTP verification flow.

### Features
- **International phone number support** with country selector
- **Real-time formatting** based on country format
- **Phone number validation**
- **Integrated OTP flow** with OTPEntry6Box
- **Resend functionality** with cooldown timer
- **Accessible design** with ARIA labels
- **Mobile-optimized** with numeric keyboard

### Usage
```tsx
import PhoneInputOTP from '@/components/auth/PhoneInputOTP';

function AuthPage() {
  const handlePhoneVerified = (phone: string) => {
    console.log('Verified phone:', phone);
  };

  return (
    <PhoneInputOTP
      defaultCountry="RW"
      onSuccess={handlePhoneVerified}
      onOTPVerified={(phone, otp) => {
        // Handle verification
      }}
    />
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | '' | Initial phone number value |
| onChange | (value: string) => void | - | Called when phone number changes |
| onOTPSent | (phone: string) => void | - | Called when OTP is sent |
| onOTPVerified | (phone: string, otp: string) => void | - | Called when OTP is verified |
| placeholder | string | 'Enter phone number' | Input placeholder |
| disabled | boolean | false | Disable input |
| error | string | - | Error message to display |
| defaultCountry | string | 'RW' | Default country code |
| showOTPInput | boolean | false | Start with OTP input shown |
| className | string | - | Additional CSS classes |

### Supported Countries
- Rwanda (+250) - Default
- Kenya (+254)
- Uganda (+256)
- Tanzania (+255)
- Burundi (+257)
- DR Congo (+243)
- United States (+1)
- United Kingdom (+44)
- France (+33)
- Germany (+49)

---

## OTPEntry6Box Component

### Overview
A 6-digit OTP input component with individual boxes for each digit, optimized for mobile and desktop use.

### Features
- **Individual digit boxes** with auto-advance
- **Paste support** for copying OTP from SMS
- **Keyboard navigation** (arrows, backspace)
- **Auto-submit** when complete
- **Error and loading states**
- **Resend functionality**
- **Accessible** with ARIA labels
- **Mobile-optimized** with numeric keyboard

### Usage
```tsx
import OTPEntry6Box from '@/components/auth/OTPEntry6Box';

function VerifyPage() {
  return (
    <OTPEntry6Box
      phoneNumber="+250788123456"
      onComplete={(otp) => {
        console.log('OTP entered:', otp);
      }}
      onSuccess={() => {
        // Navigate to next step
      }}
    />
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | '' | Initial OTP value |
| onChange | (otp: string) => void | - | Called when OTP changes |
| onComplete | (otp: string) => void | - | Called when all digits entered |
| disabled | boolean | false | Disable all inputs |
| error | boolean | false | Show error state |
| loading | boolean | false | Show loading state |
| autoFocus | boolean | true | Auto-focus first input |
| placeholder | string | '•' | Placeholder for empty boxes |
| errorMessage | string | - | Error message to display |
| length | number | 6 | Number of OTP digits |
| phoneNumber | string | - | Phone number to display |

### Keyboard Shortcuts
- **Arrow Left/Right**: Navigate between boxes
- **Backspace**: Delete current digit and move back
- **Enter**: Submit OTP when complete
- **Paste**: Automatically fills all boxes

---

## Integration Example

### Complete Phone Authentication Flow
```tsx
import { useState } from 'react';
import PhoneInputOTP from '@/components/auth/PhoneInputOTP';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function PhoneAuthPage() {
  const { linkPhoneNumber } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneVerified = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      await linkPhoneNumber(phone, otp);
      navigate('/home');
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Verify your phone</h1>
      
      <PhoneInputOTP
        defaultCountry="RW"
        onOTPVerified={handlePhoneVerified}
        disabled={isLoading}
      />
    </div>
  );
}
```

### With API Integration
```tsx
import { APIClient } from '@/services/api/APIClient';

function PhoneAuth() {
  const api = APIClient.getInstance();

  const sendOTP = async (phone: string) => {
    const response = await api.auth.sendOTP({ phoneNumber: phone });
    return response.success;
  };

  const verifyOTP = async (phone: string, otp: string) => {
    const response = await api.auth.verifyOTP({ 
      phoneNumber: phone, 
      otp 
    });
    return response.data;
  };

  return (
    <PhoneInputOTP
      onOTPSent={sendOTP}
      onOTPVerified={verifyOTP}
    />
  );
}
```

---

## Styling Customization

Both components use Tailwind CSS and can be customized:

```tsx
// Custom styling example
<PhoneInputOTP
  className="my-custom-wrapper"
  // Component will merge classes
/>

<OTPEntry6Box
  boxClassName="w-16 h-16 text-2xl" // Larger boxes
  className="gap-4" // More spacing
/>
```

---

## Accessibility Features

### PhoneInputOTP
- Proper labels for screen readers
- Keyboard navigation support
- Clear focus indicators
- Error announcements

### OTPEntry6Box
- Individual ARIA labels for each digit
- Keyboard navigation between boxes
- Clear focus management
- Status announcements

---

## Testing

Both components include comprehensive test suites:

```bash
# Run component tests
npm test src/components/auth/__tests__/PhoneInputOTP.test.tsx
npm test src/components/auth/__tests__/OTPEntry6Box.test.tsx
```

Test coverage includes:
- User interactions
- Keyboard navigation
- Paste functionality
- Error handling
- Loading states
- Accessibility features 