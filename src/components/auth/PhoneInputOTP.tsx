
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PhoneInputOTPProps {
  onSuccess: (phone: string) => void;
  onCancel?: () => void;
}

export const PhoneInputOTP: React.FC<PhoneInputOTPProps> = ({ onSuccess, onCancel }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove all non-digits
    let clean = phoneNumber.replace(/\D/g, '');
    
    // Handle Rwanda numbers
    if (clean.startsWith('0')) {
      clean = '250' + clean.substring(1);
    }
    if (!clean.startsWith('250')) {
      clean = '250' + clean;
    }
    
    return '+' + clean;
  };

  const handleSendOTP = async () => {
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

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to send OTP');
      }

      if (data?.success) {
        toast({
          title: "📱 Code sent!",
          description: "Check your WhatsApp for the 6-digit verification code",
        });
        onSuccess(formattedPhone);
      } else {
        throw new Error(data?.error || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('OTP send error:', error);
      
      let errorMessage = "Failed to send verification code. Please try again.";
      
      if (error.message?.includes('Too many requests')) {
        errorMessage = "Too many attempts, try later";
      }
      
      toast({
        title: "Failed to send verification code",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4" id="phone_input_otp">
      <div className="text-center py-4">
        <MessageCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">WhatsApp Verification</h3>
        <p className="text-gray-600 text-sm">
          We'll send you a verification code via WhatsApp
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
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter your WhatsApp number to receive a verification code
          </p>
        </div>
      </div>

      <div className="flex space-x-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSendOTP} 
          disabled={isLoading || !phoneNumber.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" id="loader_primary" />
              Sending...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 mr-2" />
              Send Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
