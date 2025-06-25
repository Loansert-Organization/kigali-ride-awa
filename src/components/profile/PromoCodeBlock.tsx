
import React from 'react';
import PromoCodeDisplayBlock from '@/components/rewards/PromoCodeDisplayBlock';

interface UserProfile {
  id: string;
  auth_user_id: string | null;
  role: 'passenger' | 'driver' | null;
  language: string;
  location_enabled: boolean;
  notifications_enabled: boolean;
  promo_code: string;
  referred_by: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface PromoCodeBlockProps {
  userProfile: UserProfile;
}

const PromoCodeBlock: React.FC<PromoCodeBlockProps> = ({ userProfile }) => {
  if (!userProfile?.promo_code) {
    return null;
  }

  return <PromoCodeDisplayBlock promoCode={userProfile.promo_code} />;
};

export default PromoCodeBlock;
