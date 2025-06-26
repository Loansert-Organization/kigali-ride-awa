
import { useWelcomeSteps } from '@/hooks/welcome/useWelcomeSteps';
import { useLanguageSelection } from '@/hooks/welcome/useLanguageSelection';
import { useRoleSelection } from '@/hooks/welcome/useRoleSelection';
import { useLocationPermission } from '@/hooks/welcome/useLocationPermission';
import { usePWAInstall } from '@/hooks/welcome/usePWAInstall';

export const useWelcomeLanding = () => {
  const {
    currentStep,
    setCurrentStep,
    showPromoInput,
    setShowPromoInput,
    promoCode,
    setPromoCode,
    isProcessing,
    setIsProcessing,
    urlPromo
  } = useWelcomeSteps();

  const {
    selectedLanguage,
    languages,
    currentLang,
    handleLanguageSelect
  } = useLanguageSelection();

  const {
    selectedRole,
    handleRoleSelect: handleRoleSelectBase
  } = useRoleSelection();

  const {
    locationGranted,
    requestLocationPermission,
    skipLocation
  } = useLocationPermission();

  const {
    showPWAPrompt,
    setShowPWAPrompt
  } = usePWAInstall();

  // Enhanced role selection handler
  const handleRoleSelect = async (role: 'passenger' | 'driver') => {
    if (isProcessing) {
      console.log('Already processing, ignoring click');
      return;
    }

    const success = await handleRoleSelectBase(
      role,
      selectedLanguage,
      urlPromo,
      promoCode,
      setIsProcessing
    );

    if (success) {
      setTimeout(() => {
        setCurrentStep('permissions');
      }, 500);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    selectedLanguage,
    selectedRole,
    showPromoInput,
    setShowPromoInput,
    promoCode,
    setPromoCode,
    locationGranted,
    showPWAPrompt,
    setShowPWAPrompt,
    isProcessing,
    urlPromo,
    languages,
    currentLang,
    handleLanguageSelect,
    handleRoleSelect,
    requestLocationPermission,
    skipLocation
  };
};
