
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

export const useDriverOnboarding = () => {
  const navigate = useNavigate();
  const { userProfile, refreshUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'en' | 'kn' | 'fr'>('en');
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [vehicleType, setVehicleType] = useState<'moto' | 'car' | 'tuktuk' | 'minibus'>('moto');
  const [plateNumber, setPlateNumber] = useState('');
  const [existingPromo, setExistingPromo] = useState('');

  useEffect(() => {
    // Get stored language and promo
    const storedLang = localStorage.getItem('language') as 'en' | 'kn' | 'fr';
    const storedPromo = localStorage.getItem('promo_code');
    
    if (storedLang) setLanguage(storedLang);
    if (storedPromo) setExistingPromo(storedPromo);
  }, []);

  const finishOnboarding = async (promoCode?: string) => {
    if (!userProfile) {
      toast({
        title: "Error",
        description: "User profile not found. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!plateNumber.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your vehicle plate number.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Finishing driver onboarding for user:', userProfile.id);
      
      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          language: language,
          location_enabled: locationGranted,
          notifications_enabled: notificationsGranted,
          referred_by: existingPromo || promoCode || null,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (userError) {
        console.error('Error updating user profile:', userError);
        throw userError;
      }

      // Create driver profile
      const { error: driverError } = await supabase
        .from('driver_profiles')
        .insert({
          user_id: userProfile.id,
          vehicle_type: vehicleType,
          plate_number: plateNumber.trim(),
          is_online: false
        });

      if (driverError) {
        console.error('Error creating driver profile:', driverError);
        throw driverError;
      }

      // Store onboarding completion in localStorage as backup
      localStorage.setItem('driver_onboarding_completed', 'true');
      
      // Refresh user profile
      await refreshUserProfile();

      toast({
        title: "Welcome to Kigali Ride!",
        description: "Your driver account is ready. Start earning today!",
      });

      // Redirect to driver home
      navigate('/home/driver');
    } catch (error) {
      console.error('Error in finishOnboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    currentStep,
    setCurrentStep,
    language,
    locationGranted,
    setLocationGranted,
    notificationsGranted,
    setNotificationsGranted,
    vehicleType,
    setVehicleType,
    plateNumber,
    setPlateNumber,
    existingPromo,
    finishOnboarding
  };
};
