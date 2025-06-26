
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Phone, Loader2, CheckCircle, Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

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
  title = "Verify with WhatsApp",
  description = "Connect your WhatsApp to secure your booking and enable driver communication"
}) => {
  const { sendOTP, login, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');

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
      toast({
        title: "📱 Code sent!",
        description: "Check your WhatsApp for the verification code",
      });
      setStep('otp');
    } else {
      toast({
        title: "Failed to send code",
        description: result.error || "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode.trim() || otpCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    const result = await login(phoneNumber, otpCode);
    if (result.success) {
      setStep('success');
      toast({
        title: "✅ Verified!",
        description: "Your WhatsApp is now connected",
      });
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      toast({
        title: "Verification failed",
        description: result.error || "Invalid or expired code",
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'phone':
        return (
          <div className="space-y-4">
            <div className="text-center py-4">
              <MessageCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="phone">WhatsApp Number</Label>
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
                  You'll receive a verification code via WhatsApp
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSendOTP} 
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
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
                onClick={handleVerifyOTP} 
                disabled={loading || otpCode.length !== 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={handleSendOTP}
                disabled={loading}
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
              Your WhatsApp is now connected to Kigali Ride
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              Completing your booking...
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
          <DialogTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
            WhatsApp Verification
          </DialogTitle>
        </DialogHeader>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};
