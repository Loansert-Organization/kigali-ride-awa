import React, { useState, useRef, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import OTPEntry6Box from './OTPEntry6Box';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  format: string;
}

// Popular countries for Rwanda region
const countries: Country[] = [
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼', format: '### ### ###' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', format: '### ### ###' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', format: '### ### ###' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', format: '### ### ###' },
  { code: 'BI', name: 'Burundi', dialCode: '+257', flag: '🇧🇮', format: '## ### ###' },
  { code: 'CD', name: 'DR Congo', dialCode: '+243', flag: '🇨🇩', format: '### ### ###' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', format: '#### ### ####' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', format: '# ## ## ## ##' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', format: '### ### ####' },
];

interface PhoneInputOTPProps {
  value?: string;
  onChange?: (value: string) => void;
  onOTPSent?: (phone: string) => void;
  onOTPVerified?: (phone: string, otp: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  countries?: string[];
  defaultCountry?: string;
  showOTPInput?: boolean;
  otpLength?: number;
  autoSendOTP?: boolean;
  className?: string;
  onSuccess?: (phoneNumber: string) => void;
  onCancel?: () => void;
}

const PhoneInputOTP: React.FC<PhoneInputOTPProps> = ({
  value = '',
  onChange,
  onOTPSent,
  onOTPVerified,
  placeholder = 'Enter phone number',
  disabled = false,
  error,
  defaultCountry = 'RW',
  showOTPInput = false,
  otpLength = 6,
  autoSendOTP = false,
  className,
  onSuccess,
  onCancel,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === defaultCountry) || countries[0]
  );
  const [phoneNumber, setPhoneNumber] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(showOTPInput);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const formatPhoneNumber = (input: string, format: string): string => {
    const numbers = input.replace(/\D/g, '');
    let formatted = '';
    let numberIndex = 0;

    for (let i = 0; i < format.length && numberIndex < numbers.length; i++) {
      if (format[i] === '#') {
        formatted += numbers[numberIndex];
        numberIndex++;
      } else {
        formatted += format[i];
      }
    }

    return formatted;
  };

  const unformatPhoneNumber = (formatted: string): string => {
    return formatted.replace(/\D/g, '');
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const unformatted = unformatPhoneNumber(phone);
    const expectedLength = selectedCountry.format.split('#').length - 1;
    return unformatted.length === expectedLength;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input, selectedCountry.format);
    setPhoneNumber(formatted);
    
    const fullNumber = selectedCountry.dialCode + unformatPhoneNumber(formatted);
    onChange?.(fullNumber);
  };

  const handleSendOTP = async () => {
    const unformatted = unformatPhoneNumber(phoneNumber);
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const fullNumber = selectedCountry.dialCode + unformatted;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOtpSent(true);
      setResendTimer(60);
      onOTPSent?.(fullNumber);
      
      toast({
        title: "OTP sent successfully",
        description: `Code sent to ${fullNumber}`,
      });
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setPhoneNumber('');
    inputRef.current?.focus();
  };

  if (otpSent) {
    // Render the OTPEntry6Box component when OTP is sent
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Enter verification code</h3>
          <p className="text-sm text-muted-foreground">
            We sent a code to {selectedCountry.dialCode} {phoneNumber}
          </p>
        </div>
        
        <OTPEntry6Box
          phoneNumber={`${selectedCountry.dialCode} ${phoneNumber}`}
          onComplete={(otp) => {
            const fullNumber = selectedCountry.dialCode + unformatPhoneNumber(phoneNumber);
            onOTPVerified?.(fullNumber, otp);
          }}
          onSuccess={() => {
            const fullNumber = selectedCountry.dialCode + unformatPhoneNumber(phoneNumber);
            onSuccess?.(fullNumber);
          }}
          onCancel={onCancel}
        />
        
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOtpSent(false);
              setPhoneNumber('');
            }}
          >
            Change number
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            disabled={resendTimer > 0}
            onClick={handleSendOTP}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[120px] justify-between"
                disabled={disabled}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm">{selectedCountry.dialCode}</span>
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px] max-h-[300px] overflow-y-auto">
              {countries.map((country) => (
                <DropdownMenuItem
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span>{country.name}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {country.dialCode}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder={selectedCountry.format.replace(/#/g, '•')}
              disabled={disabled || isLoading}
              className={cn(
                "pr-10",
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {validatePhoneNumber(phoneNumber) && (
              <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      <Button
        className="w-full"
        onClick={handleSendOTP}
        disabled={!validatePhoneNumber(phoneNumber) || disabled || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Phone className="mr-2 h-4 w-4" />
            Send verification code
          </>
        )}
      </Button>

      {onCancel && (
        <Button
          variant="ghost"
          className="w-full"
          onClick={onCancel}
        >
          Cancel
        </Button>
      )}
    </div>
  );
};

export default PhoneInputOTP;
