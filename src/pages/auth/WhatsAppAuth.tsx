import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { MessageCircle, Phone, Shield, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/services/APIClient';

const WhatsAppAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const validatePhoneNumber = (phone: string) => {
    // Rwanda phone number validation
    const rwandaRegex = /^(\+?250|0)?[72]\d{8}$/;
    return rwandaRegex.test(phone.replace(/\s/g, ''));
  };

  const formatPhoneNumber = (phone: string) => {
    // Convert to international format
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '250' + cleaned.substring(1);
    }
    
    if (!cleaned.startsWith('250')) {
      cleaned = '250' + cleaned;
    }
    
    return '+' + cleaned;
  };

  const handleSendOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: t('invalid_phone'),
        description: t('enter_valid_rwanda_phone'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Check for duplicate phone number first
      const duplicateCheck = await apiClient.auth.checkDuplicatePhone(formattedPhone);
      
      if (duplicateCheck.success && duplicateCheck.data?.exists) {
        toast({
          title: t('phone_already_registered'),
          description: t('phone_exists_try_login'),
          variant: "destructive"
        });
        return;
      }

      const response = await apiClient.auth.sendOtp(formattedPhone);
      
      if (response.success) {
        setStep('otp');
        setCountdown(60);
        setCanResend(false);
        toast({
          title: t('otp_sent'),
          description: t('check_whatsapp_for_code'),
        });
      } else {
        throw new Error(response.error?.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      toast({
        title: t('error'),
        description: t('failed_send_otp'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: t('invalid_otp'),
        description: t('enter_6_digit_code'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      const response = await apiClient.auth.verifyOtp(formattedPhone, otpCode);
      
      if (response.success && response.data) {
        setStep('success');
        
        // Login user
        await login(response.data.user, response.data.session);
        
        toast({
          title: t('success'),
          description: t('whatsapp_connected_successfully'),
        });

        // Redirect after short delay
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
      } else {
        throw new Error(response.error?.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      toast({
        title: t('error'),
        description: t('invalid_otp_try_again'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setCountdown(60);
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      await apiClient.auth.sendOtp(formattedPhone);
      
      toast({
        title: t('otp_resent'),
        description: t('new_code_sent_whatsapp'),
      });
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast({
        title: t('error'),
        description: t('failed_resend_otp'),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('whatsapp_authentication')} 
        showBack={true} 
        showHome={false}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {step === 'phone' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-600" />
                {t('connect_whatsapp')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600">{t('whatsapp_auth_description')}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t('phone_number')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0781234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-center text-lg"
                />
                <p className="text-xs text-gray-500 text-center">
                  {t('rwanda_phone_format')}
                </p>
              </div>

              <Button 
                onClick={handleSendOtp}
                disabled={loading || !phoneNumber}
                className="w-full h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('sending_code')}
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {t('send_whatsapp_code')}
                  </>
                )}
              </Button>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                <Shield className="w-4 h-4" />
                <span>{t('secure_whatsapp_verification')}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'otp' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-green-600" />
                {t('verify_code')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600">
                  {t('otp_sent_to')} <strong>{phoneNumber}</strong>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('check_whatsapp_messages')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp">{t('verification_code')}</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-xl tracking-widest"
                />
              </div>

              <Button 
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length !== 6}
                className="w-full h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('verifying')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('verify_connect')}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className="text-sm"
                >
                  {canResend ? t('resend_code') : `${t('resend_in')} ${countdown}s`}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setStep('phone')}
                className="w-full"
              >
                {t('change_phone_number')}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('whatsapp_connected')}</h3>
              <p className="text-gray-600 mb-4">{t('authentication_successful')}</p>
              <p className="text-sm text-gray-500">{t('redirecting_automatically')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhatsAppAuth;