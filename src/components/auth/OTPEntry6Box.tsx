
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ArrowLeft, Timer, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface OTPEntry6BoxProps {
  phone: string;
  onBack: () => void;
  onSuccess?: () => void;
}

export const OTPEntry6Box: React.FC<OTPEntry6BoxProps> = ({ phone, onBack, onSuccess }) => {
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyOTP = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Verifying OTP for:', phone, 'with code:', code);

      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: {
          phone: phone,
          code: code
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Verification failed');
      }

      if (data?.success && data?.user) {
        toast({
          title: "🎉 Phone verified!",
          description: "Welcome to Kigali Ride!",
        });

        // Store user data in localStorage for session management
        localStorage.setItem('whatsapp_auth_user', JSON.stringify(data.user));
        localStorage.setItem('whatsapp_phone', phone);
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/home');
        }
      } else {
        throw new Error(data?.error || 'Verification failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      let errorMessage = "Verification failed. Please try again.";
      
      if (error.message?.includes('expired') || error.message?.includes('OTP expired')) {
        errorMessage = "Code expired";
      } else if (error.message?.includes('Invalid') || error.message?.includes('invalid')) {
        errorMessage = "Invalid code";
      } else if (error.message?.includes('attempts') || error.message?.includes('rate limit')) {
        errorMessage = "Too many attempts, try later";
      }
      
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: phone }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "📱 Code resent!",
          description: "Check your WhatsApp for the new verification code",
        });
        setCountdown(60);
        setOtpCode(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (error) {
      toast({
        title: "Failed to resend code",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newOtpCode = [...otpCode];
      pastedCode.forEach((digit, i) => {
        if (index + i < 6) {
          newOtpCode[index + i] = digit;
        }
      });
      setOtpCode(newOtpCode);
      
      const nextIndex = Math.min(index + pastedCode.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      const newOtpCode = [...otpCode];
      newOtpCode[index] = value;
      setOtpCode(newOtpCode);
      
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="space-y-4" id="otp_entry_6box">
      <div className="text-center py-4">
        <Phone className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
        <p className="text-gray-600 text-sm">
          We sent a 6-digit code to {phone}
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label>Verification Code</Label>
          <div className="flex space-x-2 justify-center mb-4">
            {otpCode.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => otpRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-bold"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-3">
        <Button
          onClick={handleVerifyOTP}
          disabled={isLoading || otpCode.join('').length !== 6}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" id="loader_primary" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>

        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Change Number
          </Button>

          {countdown > 0 ? (
            <div className="flex items-center text-sm text-gray-500">
              <Timer className="w-4 h-4 mr-1" />
              Resend in {countdown}s
            </div>
          ) : (
            <Button
              variant="ghost"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-sm text-blue-600"
            >
              {isResending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Resend Code
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
