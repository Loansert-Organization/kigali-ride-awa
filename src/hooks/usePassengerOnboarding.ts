
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePassengerOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'en' | 'kn' | 'fr'>('en');
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [existingPromo, setExistingPromo] = useState('');

  useEffect(() => {
    // Get stored language and promo
    const storedLang = localStorage.getItem('language') as 'en' | 'kn' | 'fr';
    const storedPromo = localStorage.getItem('promo_code');
    
    if (storedLang) setLanguage(storedLang);
    if (storedPromo) setExistingPromo(storedPromo);
  }, []);

  const finishOnboarding = async (promoCode?: string) => {
    // Mark onboarding as completed
    localStorage.setItem('passenger_onboarding_completed', 'true');
    
    // Update Supabase with final data
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('users').upsert({
          auth_user_id: user.id,
          role: 'passenger',
          language: language,
          location_enabled: locationGranted,
          notifications_enabled: notificationsGranted,
          referred_by: existingPromo || promoCode || null,
          onboarding_completed: true
        });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }

    toast({
      title: "Welcome to Kigali Ride!",
      description: "Your passenger account is ready to use.",
    });

    // Redirect to passenger home
    navigate('/home/passenger');
  };

  return {
    currentStep,
    setCurrentStep,
    language,
    locationGranted,
    setLocationGranted,
    notificationsGranted,
    setNotificationsGranted,
    existingPromo,
    finishOnboarding
  };
};
