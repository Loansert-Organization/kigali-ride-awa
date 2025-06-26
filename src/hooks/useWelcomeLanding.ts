
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useWelcomeLanding = () => {
  const navigate = useNavigate();
  const { user, userProfile, refreshUserProfile, error: authError, retryInitialization } = useAuth();
  
  // UI State Management
  const [currentStep, setCurrentStep] = useState<'welcome' | 'language' | 'role' | 'permissions'>('welcome');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'kn' | 'fr'>('en');
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver' | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTimeout, setProcessingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check for URL promo code
  const urlParams = new URLSearchParams(window.location.search);
  const urlPromo = urlParams.get('promo');

  // Clear any errors when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // PWA Install Prompt Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setTimeout(() => setShowPWAPrompt(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Auto-detect language from browser
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setSelectedLanguage(savedLang as 'en' | 'kn' | 'fr');
      setCurrentStep('role');
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('fr')) setSelectedLanguage('fr');
      else if (browserLang.includes('rw')) setSelectedLanguage('kn');
    }
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Welcome to Kigali Ride!' },
    { code: 'kn', name: 'Kinyarwanda', flag: '🇷🇼', greeting: 'Murakaze kuri Kigali Ride!' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', greeting: 'Bienvenue sur Kigali Ride!' }
  ];

  const currentLang = languages.find(l => l.code === selectedLanguage) || languages[0];

  const clearProcessingState = () => {
    setIsProcessing(false);
    setSelectedRole(null);
    if (processingTimeout) {
      clearTimeout(processingTimeout);
      setProcessingTimeout(null);
    }
  };

  const handleLanguageSelect = (lang: 'en' | 'kn' | 'fr') => {
    setSelectedLanguage(lang);
    localStorage.setItem('language', lang);
    setError(null);
    
    setTimeout(() => {
      setCurrentStep('role');
    }, 300);
    
    toast({
      title: "Language updated",
      description: `${languages.find(l => l.code === lang)?.name} selected`,
    });
  };

  const handleRoleSelect = async (role: 'passenger' | 'driver') => {
    console.log('🔄 Role selection started:', role);
    
    if (isProcessing) {
      console.log('⚠️ Already processing, ignoring click');
      return;
    }
    
    setSelectedRole(role);
    setIsProcessing(true);
    setError(null);

    // Set processing timeout
    const timeout = setTimeout(() => {
      console.warn('⏰ Role selection timeout');
      setError('Setup is taking longer than expected. Please try again.');
      clearProcessingState();
    }, 15000);
    setProcessingTimeout(timeout);

    try {
      // First ensure we have an authenticated user
      let currentUser = user;
      if (!currentUser) {
        console.log('🔐 No authenticated user, signing in anonymously...');
        
        try {
          const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
          
          if (authError) {
            console.error('❌ Error with anonymous sign in:', authError);
            throw new Error(`Authentication failed: ${authError.message}`);
          }
          
          console.log('✅ Anonymous auth successful:', authData.user?.id);
          currentUser = authData.user;
          
          // Wait for auth state to update
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } catch (authError: any) {
          console.error('💥 Anonymous auth exception:', authError);
          throw new Error(`Could not authenticate: ${authError.message}`);
        }
      }

      if (!currentUser) {
        throw new Error('Authentication failed - no user available');
      }

      console.log('📝 Creating/updating user profile for user:', currentUser.id);

      // Store role in localStorage as backup
      localStorage.setItem('user_role', role);

      // Use the edge function to create or update user profile with better error handling
      const requestPayload = {
        profileData: {
          role: role,
          language: selectedLanguage,
          location_enabled: false,
          notifications_enabled: false,
          onboarding_completed: false,
          referred_by: urlPromo || promoCode || null
        }
      };

      console.log('🚀 Calling edge function with data:', requestPayload);

      const { data, error } = await supabase.functions.invoke('create-or-update-user-profile', {
        body: requestPayload
      });

      if (error) {
        console.error('❌ Error from edge function:', error);
        throw new Error(`Profile setup failed: ${error.message || 'Unknown error from server'}`);
      }

      console.log('✅ Profile created/updated successfully:', data);

      // Refresh the user profile to get the updated data
      console.log('🔄 Refreshing user profile...');
      const updatedProfile = await refreshUserProfile();
      
      if (!updatedProfile) {
        console.warn('Profile was created but could not be retrieved, continuing anyway');
      }
      
      // Clear timeout and navigate to permissions step
      if (processingTimeout) {
        clearTimeout(processingTimeout);
        setProcessingTimeout(null);
      }
      
      console.log('➡️ Navigating to permissions step');
      setTimeout(() => {
        setCurrentStep('permissions');
        setIsProcessing(false);
      }, 500);

      toast({
        title: "Role selected!",
        description: `Welcome as a ${role}! 🎉`,
      });

    } catch (error: any) {
      console.error('❌ Role selection error:', error);
      
      const errorMessage = error.message || 'An unexpected error occurred';
      setError(errorMessage);
      clearProcessingState();
      
      toast({
        title: "Setup Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const requestLocationPermission = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      localStorage.setItem('location_granted', 'true');
      localStorage.setItem('user_location', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      }));
      
      setLocationGranted(true);
      
      toast({
        title: "Location enabled! 📍",
        description: "Perfect! Now we can find rides near you",
      });

      navigateToOnboarding();
      
    } catch (error) {
      console.warn('Location access denied:', error);
      toast({
        title: "Location access denied",
        description: "You can enter addresses manually instead",
        variant: "destructive"
      });
      
      navigateToOnboarding();
    }
  };

  const navigateToOnboarding = () => {
    const role = selectedRole || localStorage.getItem('user_role') as 'passenger' | 'driver';
    
    if (role === 'passenger') {
      navigate('/onboarding/passenger');
    } else if (role === 'driver') {
      navigate('/onboarding/driver');
    } else {
      console.error('No role found for navigation');
      setError('No role selected. Please choose your role first.');
      setCurrentStep('role');
    }
  };

  const skipLocation = () => {
    navigateToOnboarding();
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
    error,
    urlPromo,
    languages,
    currentLang,
    handleLanguageSelect,
    handleRoleSelect,
    requestLocationPermission,
    skipLocation,
    retrySetup
  };
};
