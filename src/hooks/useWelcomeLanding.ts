
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useWelcomeLanding = () => {
  const navigate = useNavigate();
  const { user, userProfile, refreshUserProfile } = useAuth();
  
  // UI State Management
  const [currentStep, setCurrentStep] = useState<'welcome' | 'language' | 'role' | 'permissions'>('welcome');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'kn' | 'fr'>('en');
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver' | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for URL promo code
  const urlParams = new URLSearchParams(window.location.search);
  const urlPromo = urlParams.get('promo');

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

  const handleLanguageSelect = (lang: 'en' | 'kn' | 'fr') => {
    setSelectedLanguage(lang);
    localStorage.setItem('language', lang);
    
    setTimeout(() => {
      setCurrentStep('role');
    }, 300);
    
    toast({
      title: "Language updated",
      description: `${languages.find(l => l.code === lang)?.name} selected`,
    });
  };

  const handleRoleSelect = async (role: 'passenger' | 'driver') => {
    console.log('Role selection clicked:', role);
    
    if (isProcessing) {
      console.log('Already processing, ignoring click');
      return;
    }
    
    setSelectedRole(role);
    setIsProcessing(true);

    try {
      // First ensure we have an authenticated user
      let currentUser = user;
      if (!currentUser) {
        console.log('No authenticated user, signing in anonymously...');
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        
        if (authError) {
          console.error('Error with anonymous sign in:', authError);
          throw new Error('Failed to authenticate. Please try again.');
        }
        
        currentUser = authData.user;
        
        // Wait a moment for the auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      console.log('Updating user role to:', role, 'for user ID:', currentUser?.id);

      // Store role in localStorage as backup
      localStorage.setItem('user_role', role);

      // Create or update user profile with better error handling
      const profileData = {
        role: role,
        language: selectedLanguage,
        location_enabled: false,
        notifications_enabled: false,
        onboarding_completed: false,
        updated_at: new Date().toISOString()
      };

      if (!userProfile) {
        console.log('Creating new user profile...');
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            ...profileData,
            auth_user_id: currentUser?.id || null,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          throw new Error(`Profile creation failed: ${createError.message}`);
        }

        console.log('User profile created successfully:', newProfile);
      } else {
        console.log('Updating existing user profile...');
        const { error: updateError } = await supabase
          .from('users')
          .update(profileData)
          .eq('id', userProfile.id);

        if (updateError) {
          console.error('Error updating user role:', updateError);
          throw new Error(`Profile update failed: ${updateError.message}`);
        }

        console.log('User profile updated successfully');
      }

      // Refresh the user profile to get the updated data
      await refreshUserProfile();
      
      // Navigate to permissions step
      setTimeout(() => {
        setCurrentStep('permissions');
        setIsProcessing(false);
      }, 800);

      toast({
        title: "Role selected!",
        description: `Welcome as a ${role}! 🎉`,
      });

    } catch (error: any) {
      console.error('Role selection error:', error);
      setIsProcessing(false);
      setSelectedRole(null);
      
      toast({
        title: "Setup Error",
        description: error.message || "Please try again",
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
      toast({
        title: "Error",
        description: "Please select your role first",
        variant: "destructive"
      });
      setCurrentStep('role');
    }
  };

  const skipLocation = () => {
    navigateToOnboarding();
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
