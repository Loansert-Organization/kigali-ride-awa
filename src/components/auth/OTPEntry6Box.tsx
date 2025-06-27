
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface OTPEntry6BoxProps {
  phoneNumber: string;
  onSuccess: () => void;
}

const OTPEntry6Box: React.FC<OTPEntry6BoxProps> = ({
  phoneNumber,
  onSuccess
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newOtp.every(digit => digit !== '') && !isVerifying) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const codeToVerify = otpCode || otp.join('');
    
    if (codeToVerify.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter all 6 digits",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate verification (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified"
      });
      
      onSuccess();
    } catch (error) {
      console.error('OTP verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid or expired code. Please try again.",
        variant: "destructive"
      });
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      // Simulate resend (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent"
      });
      
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: "Resend Failed",
        description: "Could not resend verification code",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Verify code</CardTitle>
        <p className="text-sm text-gray-600">
          Enter the 6-digit code sent to {phoneNumber}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-medium"
              disabled={isVerifying}
            />
          ))}
        </div>

        <div className="text-center text-sm text-gray-600">
          {timeLeft > 0 ? (
            <p>Code expires in {formatTime(timeLeft)}</p>
          ) : (
            <p className="text-red-600">Code has expired</p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => handleVerify()}
            disabled={isVerifying || otp.some(digit => digit === '')}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </Button>

          <Button
            variant="outline"
            onClick={handleResend}
            disabled={!canResend || isVerifying}
            className="w-full"
          >
            {canResend ? 'Resend Code' : `Resend in ${formatTime(timeLeft)}`}
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Change Phone Number
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OTPEntry6Box;
