
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ArrowLeft, Timer } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface OTPAuthFlowProps {
  onSuccess: (user: any) => void;
  onCancel?: () => void;
}

export const OTPAuthFlow: React.FC<OTPAuthFlowProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { login } = useAuth();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (phone: string) => {
    // Format for Rwanda numbers
    let formatted = phone.replace(/\D/g, ''); // Remove non-digits
    
    if (formatted.startsWith('0')) {
      formatted = '250' + formatted.substring(1);
    }
    
    if (!formatted.startsWith('250')) {
      formatted = '250' + formatted;
    }
    
    return '+' + formatted;
  };

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      console.log('Sending OTP to:', formattedPhone);
      
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { phone: formattedPhone }
      });

      console.log('OTP send response:', { data, error });

      if (error) {
        throw error;
      }

      if (data === 'sent') {
        toast({
          title: "📱 Code sent!",
          description: "Check your WhatsApp for the verification code"
        });
        setStep('otp');
        setCountdown(60); // 60-second countdown
        // Auto-focus first OTP input
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Failed to send code",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
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
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      console.log('Verifying OTP for:', formattedPhone, 'with code:', code);
      
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { 
          phone: formattedPhone, 
          code: code 
        }
      });

      console.log('OTP verification response:', { data, error });

      if (error) {
        throw error;
      }

      if (data && typeof data === 'object' && data.token) {
        // Store the JWT token and create user session
        const { error: signInError } = await supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.token
        });

        if (signInError) {
          console.error('Session creation error:', signInError);
          throw signInError;
        }

        toast({
          title: "🎉 Verified!",
          description: "Welcome to Kigali Ride!"
        });
        
        onSuccess({ phone: formattedPhone });
      } else if (data === 'no-code') {
        throw new Error('No verification code found. Please request a new one.');
      } else if (data === 'expired') {
        throw new Error('Verification code has expired. Please request a new one.');
      } else if (data === 'wrong') {
        throw new Error('Invalid verification code. Please check and try again.');
      } else {
        throw new Error('Verification failed');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      
      let errorMessage = "Verification failed";
      if (error.message.includes('expired')) {
        errorMessage = "Code has expired. Please request a new one.";
      } else if (error.message.includes('Invalid') || error.message.includes('wrong')) {
        errorMessage = "Invalid code. Please check and try again.";
      } else if (error.message.includes('no-code')) {
        errorMessage = "No code found. Please request a new one.";
      } else {
        errorMessage = error.message || "Verification failed";
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
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + pastedCode.length, 5);
      otpRefs.current[nextIndex]?.focus();
    } else {
      // Single digit input
      const newOtpCode = [...otpCode];
      newOtpCode[index] = value;
      setOtpCode(newOtpCode);
      
      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      otpRefs.current[index - 1]?.focus();
    }
  };

  if (step === 'phone') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp Login
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Phone Number
            </label>
            <Input
              type="tel"
              placeholder="+250788123456"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-lg"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your WhatsApp number to receive a verification code
            </p>
          </div>

          <div className="flex space-x-3">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={sendOTP}
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Sending...' : 'Send Code'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Enter Verification Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            We sent a 6-digit code to {formatPhoneNumber(phoneNumber)}
          </p>
          
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

        <div className="flex flex-col space-y-3">
          <Button
            onClick={verifyOTP}
            disabled={isLoading || otpCode.join('').length !== 6}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setStep('phone')}
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
                onClick={sendOTP}
                disabled={isLoading}
                className="text-sm text-blue-600"
              >
                Resend Code
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
