
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Phone, Loader2, X, CheckCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phoneNumber: string) => void;
  userProfile: any;
}

export const WhatsAppOTPModal: React.FC<WhatsAppOTPModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userProfile
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');

  const handleSendCode = async () => {
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
      // Format phone number for Rwanda (+250)
      const formattedPhone = phoneNumber.startsWith('250') 
        ? `+${phoneNumber}` 
        : phoneNumber.startsWith('+250') 
        ? phoneNumber 
        : `+250${phoneNumber.replace(/^0+/, '')}`;

      // Call edge function to send WhatsApp verification
      const { data, error } = await supabase.functions.invoke('send-wa-code', {
        body: {
          phone: formattedPhone,
          userId: userProfile.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Code sent!",
          description: "Check your WhatsApp for the verification code",
        });
        setStep('otp');
      } else {
        throw new Error(data.error || 'Failed to send code');
      }

    } catch (error) {
      console.error('Send code error:', error);
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to verify code
      const { data, error } = await supabase.functions.invoke('verify-wa-code', {
        body: {
          userId: userProfile.id,
          inputCode: otpCode
        }
      });

      if (error) throw error;

      if (data.success) {
        setStep('success');
        toast({
          title: "Verified!",
          description: "Your WhatsApp has been successfully verified",
        });
        
        // Call success callback with phone number
        setTimeout(() => {
          onSuccess(data.phoneNumber);
        }, 1500);
      } else {
        throw new Error(data.message || 'Verification failed');
      }

    } catch (error) {
      console.error('Verify code error:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast({
      title: "Continuing as guest",
      description: "You can verify your phone later in settings",
    });
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'phone':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <MessageCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verify with WhatsApp</h3>
              <p className="text-gray-600 text-sm">
                We'll send you a verification code on WhatsApp to secure your account
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-gray-100 border border-r-0 rounded-l-md">
                    <span className="text-sm text-gray-600">🇷🇼 +250</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="788123456"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll send you a 6-digit verification code
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip for now
              </Button>
              <Button 
                onClick={handleSendCode} 
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4 mr-2" />
                )}
                Send Code
              </Button>
            </div>
          </div>
        );

      case 'otp':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Phone className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enter Verification Code</h3>
              <p className="text-gray-600 text-sm">
                We sent a 6-digit code to your WhatsApp
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Code expires in 10 minutes
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('phone')} 
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleVerifyCode} 
                disabled={isLoading || otpCode.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={handleSendCode}
                disabled={isLoading}
                className="text-sm"
              >
                Didn't receive code? Resend
              </Button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Verified Successfully!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your WhatsApp is now connected to your Kigali Ride account
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Redirecting...
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
              WhatsApp Verification
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
