
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Phone, Loader2, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface WhatsAppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phoneNumber: string) => void;
  title?: string;
  description?: string;
}

export const WhatsAppAuthModal: React.FC<WhatsAppAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Continue with WhatsApp",
  description = "Let's connect you on WhatsApp to make booking faster. Just tap and go!"
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'verifying' | 'success'>('phone');

  const handleSendWhatsApp = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setStep('verifying');

    try {
      // Format phone number for Rwanda (+250)
      const formattedPhone = phoneNumber.startsWith('250') 
        ? `+${phoneNumber}` 
        : phoneNumber.startsWith('+250') 
        ? phoneNumber 
        : `+250${phoneNumber.replace(/^0+/, '')}`;

      // Create WhatsApp verification message
      const message = `Hello! Verify your phone number for Kigali Ride: ${formattedPhone}. Click this link to continue: ${window.location.origin}/verify-whatsapp?phone=${encodeURIComponent(formattedPhone)}`;
      
      const whatsappUrl = `https://wa.me/${formattedPhone.replace('+', '')}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Simulate verification process
      setTimeout(() => {
        setStep('success');
        toast({
          title: "WhatsApp sent!",
          description: "Check WhatsApp and click the verification link",
        });
        
        // Call success callback
        onSuccess(formattedPhone);
      }, 2000);

    } catch (error) {
      console.error('WhatsApp auth error:', error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp message. Please try again.",
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
          <>
            <div className="space-y-4">
              <div className="text-center py-4">
                <MessageCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
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
                    We'll send you a verification message on WhatsApp
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  Skip for now
                </Button>
                <Button 
                  onClick={handleSendWhatsApp} 
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send WhatsApp
                </Button>
              </div>
            </div>
          </>
        );

      case 'verifying':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 mx-auto text-green-500 mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Opening WhatsApp...</h3>
            <p className="text-gray-600 text-sm">
              Check your WhatsApp app and click the verification link
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Verification Sent!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Check WhatsApp and click the link to complete verification
            </p>
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Continue
            </Button>
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
              <Phone className="w-5 h-5 mr-2 text-green-600" />
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
