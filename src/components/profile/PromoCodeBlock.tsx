
import React from 'react';
import PromoCodeDisplayBlock from '@/components/rewards/PromoCodeDisplayBlock';

interface PromoCodeBlockProps {
  promoCode: string;
}

const PromoCodeBlock: React.FC<PromoCodeBlockProps> = ({ promoCode }) => {
  if (!promoCode) {
    return null;
  }

  return <PromoCodeDisplayBlock promoCode={promoCode} />;
};

export default PromoCodeBlock;
