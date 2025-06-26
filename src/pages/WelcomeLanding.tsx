
import React from 'react';
import { useWelcomeLanding } from '@/hooks/useWelcomeLanding';
import WelcomeStep from '@/components/welcome/WelcomeStep';
import LanguageStep from '@/components/welcome/LanguageStep';
import RoleStep from '@/components/welcome/RoleStep';
import PermissionsStep from '@/components/welcome/PermissionsStep';

const WelcomeLanding = () => {
  const {
    currentStep,
    setCurrentStep,
    selectedLanguage,
    selectedRole,
    showPromoInput,
    setShowPromoInput,
    promoCode,
    setPromoCode,
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
  } = useWelcomeLanding();

  // Welcome Step
  if (currentStep === 'welcome') {
    return <WelcomeStep onGetStarted={() => setCurrentStep('language')} />;
  }

  // Language Selection Step
  if (currentStep === 'language') {
    return (
      <LanguageStep
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageSelect={handleLanguageSelect}
      />
    );
  }

  // Role Selection Step
  if (currentStep === 'role') {
    return (
      <RoleStep
        currentLang={currentLang}
        onRoleSelect={handleRoleSelect}
        isProcessing={isProcessing}
        selectedRole={selectedRole}
        urlPromo={urlPromo}
        showPromoInput={showPromoInput}
        setShowPromoInput={setShowPromoInput}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
      />
    );
  }

  // Permissions Step
  if (currentStep === 'permissions') {
    return (
      <PermissionsStep
        selectedRole={selectedRole}
        onRequestLocation={requestLocationPermission}
        onSkipLocation={skipLocation}
        showPWAPrompt={showPWAPrompt}
        setShowPWAPrompt={setShowPWAPrompt}
      />
    );
  }

  return null;
};

export default WelcomeLanding;
