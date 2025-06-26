
import React from 'react';
import { useWelcomeLanding } from '@/hooks/useWelcomeLanding';
import { useAuth } from '@/contexts/AuthContext';
import WelcomeStep from '@/components/welcome/WelcomeStep';
import LanguageStep from '@/components/welcome/LanguageStep';
import RoleStep from '@/components/welcome/RoleStep';
import PermissionsStep from '@/components/welcome/PermissionsStep';
import ErrorRecoveryScreen from '@/components/welcome/ErrorRecoveryScreen';
import AuthDebug from '@/components/debug/AuthDebug';
import { Loader2 } from 'lucide-react';

const WelcomeLanding = () => {
  const { 
    loading: authLoading, 
    error: authError, 
    isRetrying,
    retryInitialization,
    clearError,
    debugInfo,
    performHealthCheck
  } = useAuth();
  
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

  // Handle critical errors with recovery screen
  if (error || authError) {
    return (
      <>
        <ErrorRecoveryScreen
          error={error || authError || 'An unexpected error occurred'}
          onRetry={() => {
            clearError();
            if (authError) {
              retryInitialization();
            } else {
              retrySetup();
            }
          }}
          onHealthCheck={performHealthCheck}
          isRetrying={isRetrying}
          debugInfo={debugInfo}
        />
        <AuthDebug />
      </>
    );
  }

  // Show loading state with timeout awareness
  if (authLoading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600 font-medium mb-2">Setting up your ride experience...</p>
            <p className="text-sm text-gray-500">This should only take a moment</p>
            
            {/* Show additional help after some time */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">
                If this is taking too long, please check your internet connection
              </p>
            </div>
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
          languages={languages}
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
