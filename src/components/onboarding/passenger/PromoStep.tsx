import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Gift, Rocket, Check } from 'lucide-react';

interface PromoStepProps {
  onComplete: () => void;
  onPromoCodeSaved?: (code: string) => void;
  t: (key: string) => string;
}

const PromoStep: React.FC<PromoStepProps> = ({
  onComplete,
  onPromoCodeSaved,
  t
}) => {
  const [promoCode, setPromoCode] = useState('');

  const handlePromoSubmit = () => {
    if (promoCode.trim() && promoCode.startsWith('RIDE-') && promoCode.length >= 6) {
      localStorage.setItem('promo_code', promoCode);
      onPromoCodeSaved?.(promoCode);
    } else {
      onComplete();
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-purple-600" />
          </div>
          
          {onPromoCodeSaved ? (
            <div>
              <h2 className="text-xl font-semibold text-green-700">{t('promoJoining')}</h2>
              <div className="text-2xl font-bold text-green-600 mt-2 flex items-center justify-center">
                <Check className="w-6 h-6 mr-2" />
                {promoCode}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold">Got a promo code?</h2>
              <p className="text-gray-600 mt-2">Enter it to unlock rewards</p>
            </div>
          )}
        </div>
        
        {!onPromoCodeSaved && (
          <div className="space-y-3 mb-4">
            <Input
              type="text"
              placeholder={t('promoPlaceholder')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full text-center font-mono"
              maxLength={10}
            />
          </div>
        )}
        
        <Button 
          onClick={handlePromoSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 py-3"
        >
          <Rocket className="w-5 h-5 mr-2" />
          {t('continueApp')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PromoStep;
