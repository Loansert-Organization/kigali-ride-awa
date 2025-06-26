
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, ArrowLeft, Timer } from 'lucide-react';
import { useOTPAuth } from "@/hooks/useOTPAuth";

interface OTPAuthFlowProps {
  onSuccess: (user: any) => void;
  onCancel?: () => void;
}

export const OTPAuthFlow: React.FC<OTPAuthFlowProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);
  const [currentPhone, setCurrentPhone] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { sendOTP, verifyOTP, isLoading } = useOTPAuth();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      return;
    }

    const result = await sendOTP(phoneNumber);
    
    if (result.success) {
      setCurrentPhone(result.phone || phoneNumber);
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      return;
    }

    const result = await verifyOTP(currentPhone, code);
    
    if (result.success) {
      onSuccess(result.user);
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
              onClick={handleSendOTP}
              disabled={isLoading || !phoneNumber.trim()}
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
            We sent a 6-digit code to {currentPhone}
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
            onClick={handleVerifyOTP}
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
                onClick={handleSendOTP}
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
