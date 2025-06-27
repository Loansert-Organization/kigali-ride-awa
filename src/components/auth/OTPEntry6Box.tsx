import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface OTPEntry6BoxProps {
  value?: string;
  onChange?: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  error?: boolean;
  loading?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
  boxClassName?: string;
  errorMessage?: string;
  length?: number;
  phoneNumber?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const OTPEntry6Box: React.FC<OTPEntry6BoxProps> = ({
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error = false,
  loading = false,
  autoFocus = true,
  placeholder = '•',
  className,
  boxClassName,
  errorMessage,
  length = 6,
  phoneNumber,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(
    value ? value.split('').slice(0, length) : Array(length).fill('')
  );
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null));

  useEffect(() => {
    if (value) {
      const newOtp = value.split('').slice(0, length);
      while (newOtp.length < length) {
        newOtp.push('');
      }
      setOtp(newOtp);
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
      setFocusedIndex(0);
    }
  }, [autoFocus]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
      setFocusedIndex(index);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (disabled || loading) return;

    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange?.(otpString);

    // Auto-advance to next input
    if (digit && index < length - 1) {
      focusInput(index + 1);
    }

    // Check if complete
    if (newOtp.every(d => d !== '') && newOtp.length === length) {
      onComplete?.(otpString);
      handleVerifyOTP(otpString);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || loading) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index]) {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous box and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const otpString = otp.join('');
      if (otpString.length === length) {
        onComplete?.(otpString);
        handleVerifyOTP(otpString);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled || loading) return;

    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    const otpString = newOtp.join('');
    onChange?.(otpString);

    // Focus the next empty box or the last box
    const nextEmptyIndex = newOtp.findIndex((digit, idx) => !digit && idx >= pastedData.length);
    if (nextEmptyIndex !== -1) {
      focusInput(nextEmptyIndex);
    } else {
      focusInput(length - 1);
    }

    // Check if complete
    if (newOtp.every(d => d !== '') && newOtp.length === length) {
      onComplete?.(otpString);
      handleVerifyOTP(otpString);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select all text when focusing
    inputRefs.current[index]?.select();
  };

  const handleVerifyOTP = async (otpCode: string) => {
    if (loading) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Verification successful",
        description: "Your phone number has been verified",
      });
      
      onSuccess?.();
      
      // Navigate to home or next step
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Invalid code. Please try again.",
        variant: "destructive",
      });
      
      // Clear OTP on error
      setOtp(Array(length).fill(''));
      focusInput(0);
    }
  };

  const isComplete = otp.every(d => d !== '') && otp.length === length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }, (_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            onBlur={() => setFocusedIndex(null)}
            disabled={disabled || loading}
            placeholder={placeholder}
            className={cn(
              "w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-semibold",
              "border-2 rounded-lg transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              {
                "border-input bg-background": !error && focusedIndex !== index,
                "border-primary ring-primary": !error && focusedIndex === index,
                "border-destructive ring-destructive": error,
                "bg-muted cursor-not-allowed": disabled || loading,
                "hover:border-primary": !disabled && !loading && !error,
              },
              boxClassName
            )}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>

      {errorMessage && (
        <p className="text-sm text-destructive text-center">{errorMessage}</p>
      )}

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={() => handleVerifyOTP(otp.join(''))}
          disabled={!isComplete || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify code'
          )}
        </Button>

        {onCancel && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {phoneNumber && (
          <p>Enter the 6-digit code sent to {phoneNumber}</p>
        )}
      </div>
    </div>
  );
};

export default OTPEntry6Box;
