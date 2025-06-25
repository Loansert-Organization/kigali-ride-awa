
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Gift } from 'lucide-react';

interface PromoCodeSectionProps {
  promoCode: string;
  setPromoCode: (code: string) => void;
  urlPromo: string;
  t: any;
}

const PromoCodeSection: React.FC<PromoCodeSectionProps> = ({
  promoCode,
  setPromoCode,
  urlPromo,
  t
}) => {
  const [showPromoInput, setShowPromoInput] = useState(false);

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      {urlPromo ? (
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <Gift className="w-8 h-8 mx-auto text-green-600 mb-2" />
          <p className="text-green-700 font-medium">{t.promoJoining}</p>
          <p className="text-2xl font-bold text-green-600">RIDE-{urlPromo}</p>
        </div>
      ) : (
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPromoInput(!showPromoInput)}
            className="w-full mb-2"
          >
            <Gift className="w-4 h-4 mr-2" />
            {t.promoTitle}
          </Button>
          {showPromoInput && (
            <input
              type="text"
              placeholder={t.promoPlaceholder}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono"
              maxLength={10}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PromoCodeSection;
