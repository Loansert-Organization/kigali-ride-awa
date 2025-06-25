
import React from 'react';
import PromoCodeDisplayBlock from '@/components/rewards/PromoCodeDisplayBlock';

interface PromoCodeBlockProps {
  userProfile: any;
}

const PromoCodeBlock: React.FC<PromoCodeBlockProps> = ({ userProfile }) => {
  if (!userProfile?.promo_code) {
    return null;
  }

  return <PromoCodeDisplayBlock promoCode={userProfile.promo_code} />;
};

export default PromoCodeBlock;
