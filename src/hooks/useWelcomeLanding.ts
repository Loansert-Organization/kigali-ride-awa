import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguageSelection } from './welcome/useLanguageSelection';
import { useRoleSelection } from './welcome/useRoleSelection';
import { usePWAPrompt } from './welcome/usePWAPrompt';
import { useLocationPermissions } from './welcome/useLocationPermissions';

export const useWelcomeLanding = () => {
  const { error: authError, retryInitialization } = useAuth();
  
  // UI State Management
  const [currentStep, setCurrentStep] = useState<'welcome' | 'language' | 'role' | 'permissions'>('welcome');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check for URL promo code
  const urlParams = new URLSearchParams(window.location.search);
  const urlPromo = urlParams.get('promo');

  // Use the specialized hooks
  const {
    selectedLanguage,
    currentLang,
    languages,
    handleLanguageSelect: originalHandleLanguageSelect
  } = useLanguageSelection();

  const {
    selectedRole,
    isProcessing,
    handleRoleSelect: originalHandleRoleSelect,
    clearProcessingState
  } = useRoleSelection(selectedLanguage, urlPromo, promoCode);

  const { showPWAPrompt, setShowPWAPrompt } = usePWAPrompt();
  const { locationGranted, requestLocationPermission, skipLocation } = useLocationPermissions();

  // Clear any errors when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Auto-navigate to role step if language is already saved
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && currentStep === 'welcome') {
      setCurrentStep('role');
    }
  }, [currentStep]);

  const handleLanguageSelect = (lang: 'en' | 'kn' | 'fr') => {
    originalHandleLanguageSelect(lang);
    setError(null);
    
    setTimeout(() => {
      setCurrentStep('role');
    }, 300);
  };

  const handleRoleSelect = async (role: 'passenger' | 'driver') => {
    setError(null);
    
    try {
      await originalHandleRoleSelect(role);
      
      // Navigate to permissions step on success
      setTimeout(() => {
        setCurrentStep('permissions');
      }, 500);
      
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const retrySetup = () => {
    setError(null);
    clearProcessingState();
    
    // If it's an auth error, retry the entire initialization
    if (authError) {
      retryInitialization();
    } else {
      // Otherwise, just reset to role selection
      setCurrentStep('role');
    }
  };

  return {
    // Step management
    currentStep,
    setCurrentStep,
    
    // Language
    selectedLanguage,
    languages,
    currentLang,
    handleLanguageSelect,
    
    // Role selection
    selectedRole,
    isProcessing,
    handleRoleSelect,
    
    // Promo code
    urlPromo,
    showPromoInput,
    setShowPromoInput,
    promoCode,
    setPromoCode,
    
    // Location
    locationGranted,
    requestLocationPermission,
    skipLocation,
    
    // PWA
    showPWAPrompt,
    setShowPWAPrompt,
    
    // Error handling
    error,
    retrySetup
  };
};
