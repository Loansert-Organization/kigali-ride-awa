
import { useState, useEffect } from 'react';

export const useWelcomeSteps = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'language' | 'role' | 'permissions'>('welcome');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for URL promo code
  const urlParams = new URLSearchParams(window.location.search);
  const urlPromo = urlParams.get('promo');

  return {
    currentStep,
    setCurrentStep,
    showPromoInput,
    setShowPromoInput,
    promoCode,
    setPromoCode,
    isProcessing,
    setIsProcessing,
    urlPromo
  };
};
