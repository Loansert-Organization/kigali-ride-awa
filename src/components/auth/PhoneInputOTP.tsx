
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface PhoneInputOTPProps {
  onSuccess: (phoneNumber: string) => void;
  onCancel: () => void;
}

const PhoneInputOTP: React.FC<PhoneInputOTPProps> = ({
  onSuccess,
  onCancel
}) => {
  const [countryCode, setCountryCode] = useState('+250');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const countries = [
    { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+256', name: 'Uganda', flag: '🇺🇬' },
    { code: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
    { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  ];

  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (typically 9-10 digits for mobile)
    if (digits.length < 9 || digits.length > 10) {
      return false;
    }

    // Additional validation can be added here based on country
    return true;
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits and spaces
    const cleaned = value.replace(/[^\d\s]/g, '');
    setPhoneNumber(formatPhoneNumber(cleaned));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (!validatePhoneNumber(cleanPhone)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanPhone}`;
    
    setIsLoading(true);
    
    try {
      // Simulate sending OTP (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Verification Code Sent",
        description: `Code sent to ${fullPhoneNumber}`
      });
      
      onSuccess(fullPhoneNumber);
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: "Failed to Send Code",
        description: "Please check your phone number and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Enter Your Phone Number</CardTitle>
        <p className="text-sm text-gray-600">
          We'll send you a verification code via SMS
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.code} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="flex">
              <div className="flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md">
                <span className="text-sm font-medium">{countryCode}</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="788 123 456"
                className="rounded-l-none"
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send verification code'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhoneInputOTP;
