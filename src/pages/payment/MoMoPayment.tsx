import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/ui/page-header';
import { CreditCard, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/use-toast';

interface PaymentDetails {
  tripId: string;
  amount: number;
  driverName: string;
  route: string;
}

const MoMoPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useLocalization();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [step, setStep] = useState<'details' | 'ussd' | 'confirmation' | 'success'>('details');
  const [ussdCode, setUssdCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes timeout

  const tripId = searchParams.get('tripId');
  const amount = searchParams.get('amount');

  useEffect(() => {
    // Mock payment details - in real app, fetch from API
    if (tripId && amount) {
      setPaymentDetails({
        tripId,
        amount: parseFloat(amount),
        driverName: 'John Uwimana',
        route: 'Kimironko → Nyabugogo'
      });
    } else {
      toast({
        title: t('error'),
        description: 'Invalid payment details',
        variant: "destructive"
      });
      navigate('/passenger/home');
    }
  }, [tripId, amount, t, navigate, toast]);

  useEffect(() => {
    if (step === 'ussd' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      toast({
        title: t('payment_timeout'),
        description: t('payment_session_expired'),
        variant: "destructive"
      });
      setStep('details');
      setCountdown(120);
    }
  }, [step, countdown, t, toast]);

  const validatePhoneNumber = (phone: string) => {
    // Rwanda MoMo numbers validation (MTN: 078, Airtel: 073)
    const rwandaMoMoRegex = /^(078|073)\d{7}$/;
    return rwandaMoMoRegex.test(phone);
  };

  const handleInitiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast({
        title: t('invalid_phone'),
        description: t('enter_valid_momo_number'),
        variant: "destructive"
      });
      return;
    }

    if (!paymentDetails) return;

    setIsProcessing(true);
    
    try {
      // Generate USSD code based on network
      const network = phoneNumber.startsWith('078') ? 'MTN' : 'Airtel';
      const generatedCode = network === 'MTN' 
        ? `*182*8*1*${paymentDetails.amount}*${phoneNumber}#`
        : `*500*2*1*${paymentDetails.amount}*${phoneNumber}#`;
      
      setUssdCode(generatedCode);
      setStep('ussd');
      setCountdown(120);

      toast({
        title: t('ussd_generated'),
        description: t('dial_ussd_code_to_pay'),
      });
    } catch (error) {
      console.error('Payment initiation failed:', error);
      toast({
        title: t('error'),
        description: t('failed_initiate_payment'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    setStep('confirmation');
    
    // Simulate payment confirmation after 3 seconds
    setTimeout(() => {
      setStep('success');
      toast({
        title: t('payment_successful'),
        description: t('payment_confirmed_driver'),
      });
    }, 3000);
  };

  const handleManualConfirmation = () => {
    setStep('success');
    toast({
      title: t('payment_confirmed'),
      description: t('payment_manually_confirmed'),
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('copied'),
      description: t('ussd_code_copied'),
    });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title={t('payment')} 
        showBack={true} 
        showHome={false}
      />
      
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t('payment_details')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('route')}:</span>
              <span className="font-medium">{paymentDetails.route}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('driver')}:</span>
              <span className="font-medium">{paymentDetails.driverName}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>{t('total_amount')}:</span>
              <span className="text-green-600">{paymentDetails.amount} RWF</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Steps */}
        {step === 'details' && (
          <Card>
            <CardHeader>
              <CardTitle>Mobile Money Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t('momo_phone_number')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="078XXXXXXX or 073XXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="text-center text-lg"
                />
                <p className="text-xs text-gray-500 text-center">
                  {t('momo_supported_networks')}
                </p>
              </div>

              <Button 
                onClick={handleInitiatePayment}
                disabled={isProcessing || !phoneNumber}
                className="w-full h-12"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('processing')}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('generate_ussd_code')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'ussd' && (
          <Card>
            <CardHeader>
              <CardTitle>Dial USSD Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">{t('dial_code_on_phone')}</p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-mono font-bold text-blue-800 mb-2">
                    {ussdCode}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(ussdCode)}
                  >
                    {t('copy_code')}
                  </Button>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>{t('session_expires_in')}: <span className="font-bold text-red-600">{formatCountdown(countdown)}</span></p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleConfirmPayment}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('i_have_paid')}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setStep('details')}
                  className="w-full"
                >
                  {t('change_phone_number')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'confirmation' && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-semibold mb-2">{t('confirming_payment')}</h3>
              <p className="text-gray-600 mb-4">{t('checking_payment_status')}</p>
              
              <Button 
                variant="outline"
                onClick={handleManualConfirmation}
                className="mt-4"
              >
                {t('confirm_manually')}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('payment_successful')}</h3>
              <p className="text-gray-600 mb-4">{t('payment_receipt_sent')}</p>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/passenger/home')}
                  className="w-full"
                >
                  {t('back_to_home')}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/passenger/history')}
                  className="w-full"
                >
                  {t('view_trip_history')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">{t('payment_help')}</p>
                <p className="text-yellow-700">{t('payment_help_description')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoMoPayment;