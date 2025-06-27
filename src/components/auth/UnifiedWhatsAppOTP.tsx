
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import PhoneInputOTP from "./PhoneInputOTP";
import OTPEntry6Box from "./OTPEntry6Box";

interface UnifiedWhatsAppOTPProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const UnifiedWhatsAppOTP: React.FC<UnifiedWhatsAppOTPProps> = ({ 
  onSuccess, 
  onCancel,
  className 
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePhoneSuccess = (phone: string) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setPhoneNumber('');
  };

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        {step === 'phone' ? (
          <PhoneInputOTP
            onSuccess={handlePhoneSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <OTPEntry6Box
            phoneNumber={phoneNumber}
            onBack={handleBackToPhone}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedWhatsAppOTP;
