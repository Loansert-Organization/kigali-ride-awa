
import React from 'react';
import { useWelcomeLanding } from '@/hooks/useWelcomeLanding';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeStep from '@/components/welcome/WelcomeStep';
import LanguageStep from '@/components/welcome/LanguageStep';
import RoleStep from '@/components/welcome/RoleStep';
import PermissionsStep from '@/components/welcome/PermissionsStep';
import ErrorRecoveryModal from '@/components/welcome/ErrorRecoveryModal';
import AuthDebug from '@/components/debug/AuthDebug';
import { Loader2 } from 'lucide-react';

const WelcomeLanding = () => {
  const { loading: authLoading, error: authError } = useAuth();
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
    error,
    urlPromo,
    languages,
    currentLang,
    handleLanguageSelect,
    handleRoleSelect,
    requestLocationPermission,
    skipLocation,
    retrySetup
  } = useWelcomeLanding();

  // Show error recovery modal if there's an error
  if (error || authError) {
    return (
      <>
        <ErrorRecoveryModal
          error={error || authError || 'An unexpected error occurred'}
          onRetry={retrySetup}
          isRetrying={authLoading}
        />
        <AuthDebug />
      </>
    );
  }

  // Show loading state during initial auth
  if (authLoading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600 font-medium">Setting up your ride experience...</p>
            <p className="text-sm text-gray-500 mt-2">This should only take a moment</p>
          </div>
        </div>
        <AuthDebug />
      </>
    );
  }

  // Welcome Step
  if (currentStep === 'welcome') {
    return (
      <>
        <WelcomeStep onGetStarted={() => setCurrentStep('language')} />
        <AuthDebug />
      </>
    );
  }

  // Language Selection Step
  if (currentStep === 'language') {
    return (
      <>
        <LanguageStep
          languages={[...languages]}
          selectedLanguage={selectedLanguage}
          onLanguageSelect={handleLanguageSelect}
        />
        <AuthDebug />
      </>
    );
  }

  // Role Selection Step
  if (currentStep === 'role') {
    return (
      <>
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
        <AuthDebug />
      </>
    );
  }

  // Permissions Step
  if (currentStep === 'permissions') {
    return (
      <>
        <PermissionsStep
          selectedRole={selectedRole}
          onRequestLocation={requestLocationPermission}
          onSkipLocation={skipLocation}
          showPWAPrompt={showPWAPrompt}
          setShowPWAPrompt={setShowPWAPrompt}
        />
        <AuthDebug />
      </>
    );
  }

  return null;
};

export default WelcomeLanding;
