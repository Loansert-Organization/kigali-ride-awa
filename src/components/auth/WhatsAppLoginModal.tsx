
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Phone, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useWhatsAppAuth } from '@/contexts/WhatsAppAuthContext';

interface WhatsAppLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const WhatsAppLoginModal: React.FC<WhatsAppLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Login with WhatsApp",
  description = "Verify your WhatsApp number to continue"
}) => {
  const { sendOTP, login, loading } = useWhatsAppAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your WhatsApp number",
        variant: "destructive"
      });
      return;
    }

    const result = await sendOTP(phoneNumber);
    
    if (result.success) {
      setOtpSent(true);
      setStep('otp');
      toast({
        title: "📱 OTP sent!",
        description: "Check your WhatsApp for the verification code",
      });
    } else {
      toast({
        title: "Failed to send OTP",
        description: result.error || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code from WhatsApp",
        variant: "destructive"
      });
      return;
    }

    const result = await login(phoneNumber, otpCode);
    
    if (result.success) {
      toast({
        title: "🎉 Verified!",
        description: "You're now logged in with WhatsApp",
      });
      onSuccess();
      onClose();
      resetForm();
    } else {
      toast({
        title: "Verification failed",
        description: result.error || "Invalid or expired code",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setPhoneNumber('');
    setOtpCode('');
    setStep('phone');
    setOtpSent(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            {title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'phone' && (
            <>
              <div>
                <Label htmlFor="phone">WhatsApp Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="250 XXX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Rwanda WhatsApp number
                </p>
              </div>

              <Button
                onClick={handleSendOTP}
                disabled={loading || !phoneNumber.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send WhatsApp Code
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('phone')}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Change Number
                </Button>
                <p className="text-sm text-gray-600">
                  Code sent to WhatsApp: <strong>{phoneNumber}</strong>
                </p>
              </div>

              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  disabled={loading}
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit code from WhatsApp
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Login'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="w-full"
                >
                  Resend Code
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
