
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, MapPin, Car, User, Globe, Gift, Navigation } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WelcomeLanding = () => {
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
    
    // Smooth transition with confetti effect
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
    
    if (!user) {
      console.log('No user found, cannot select role');
      toast({
        title: "Error",
        description: "Please wait for authentication to complete",
        variant: "destructive"
      });
      return;
    }

    setSelectedRole(role);
    setIsProcessing(true);

    try {
      console.log('Updating user role to:', role, 'for user ID:', user.id);

      // First check if we have a user profile
      if (!userProfile) {
        console.log('No user profile found, creating one first');
        // Create profile first
        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            auth_user_id: user.id,
            role: role,
            language: selectedLanguage,
            location_enabled: false,
            notifications_enabled: false,
            onboarding_completed: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          throw createError;
        }

        console.log('User profile created successfully:', newProfile);
      } else {
        // Update existing profile
        const { error } = await supabase
          .from('users')
          .update({ 
            role: role,
            language: selectedLanguage,
            updated_at: new Date().toISOString()
          })
          .eq('id', userProfile.id);

        if (error) {
          console.error('Error updating user role:', error);
          throw error;
        }

        console.log('User profile updated successfully');
      }

      // Refresh the user profile to get the updated data
      await refreshUserProfile();
      
      // Micro-interaction: pulse effect
      setTimeout(() => {
        setCurrentStep('permissions');
        setIsProcessing(false);
      }, 500);

      toast({
        title: "Role selected!",
        description: `Welcome as a ${role}! 🎉`,
      });
    } catch (error) {
      console.error('Role selection error:', error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Please try again",
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

      // Auto-complete onboarding flow
      setTimeout(() => {
        if (selectedRole === 'passenger') {
          navigate('/onboarding/passenger');
        } else {
          navigate('/onboarding/driver');
        }
      }, 1500);
      
    } catch (error) {
      toast({
        title: "Location access denied",
        description: "You can enter addresses manually instead",
        variant: "destructive"
      });
      
      // Still proceed to onboarding
      setTimeout(() => {
        if (selectedRole === 'passenger') {
          navigate('/onboarding/passenger');
        } else {
          navigate('/onboarding/driver');
        }
      }, 1000);
    }
  };

  const skipLocation = () => {
    if (selectedRole === 'passenger') {
      navigate('/onboarding/passenger');
    } else {
      navigate('/onboarding/driver');
    }
  };

  // Welcome Step
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="animate-bounce mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <Car className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🚗 Kigali Ride
            </h1>
            <p className="text-gray-600 mb-8">
              Fast, reliable rides across Kigali
            </p>

            <Button 
              onClick={() => setCurrentStep('language')}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3 text-lg animate-pulse"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Language Selection Step
  if (currentStep === 'language') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Globe className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Language</h2>
              <p className="text-gray-600">Select your preferred language</p>
            </div>

            <div className="space-y-3">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  className="w-full justify-start text-left hover-scale"
                  onClick={() => handleLanguageSelect(lang.code as 'en' | 'kn' | 'fr')}
                >
                  <span className="text-2xl mr-3">{lang.flag}</span>
                  <span className="text-lg">{lang.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Role Selection Step
  if (currentStep === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentLang.greeting}
              </h1>
              <p className="text-gray-600 mb-6">A smarter way to get around</p>
              <h2 className="text-xl font-semibold text-gray-800">👤 Are you a...</h2>
            </div>

            <div className="space-y-4 mb-6">
              <Button 
                onClick={() => handleRoleSelect('driver')}
                disabled={isProcessing}
                className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Car className="w-8 h-8 mr-3" />
                <div className="text-left">
                  <div className="font-bold text-lg">
                    {isProcessing && selectedRole === 'driver' ? '⏳ Setting up...' : '🚗 I\'m a Driver'}
                  </div>
                  <div className="text-sm opacity-90">Offer rides and earn money</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => handleRoleSelect('passenger')}
                disabled={isProcessing}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <User className="w-8 h-8 mr-3" />
                <div className="text-left">
                  <div className="font-bold text-lg">
                    {isProcessing && selectedRole === 'passenger' ? '⏳ Setting up...' : '🧑🏾 I\'m a Passenger'}
                  </div>
                  <div className="text-sm opacity-90">Book rides across Kigali</div>
                </div>
              </Button>
            </div>

            {/* Promo Code Section */}
            {urlPromo ? (
              <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                <Gift className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-green-700 font-medium">Joining with promo code</p>
                <p className="text-2xl font-bold text-green-600">RIDE-{urlPromo}</p>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPromoInput(!showPromoInput)}
                  className="mb-2"
                  disabled={isProcessing}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  💬 Have a code?
                </Button>
                {showPromoInput && (
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono"
                    maxLength={10}
                    disabled={isProcessing}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Permissions Step
  if (currentStep === 'permissions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">📍 Enable Location</h2>
              <p className="text-gray-600">We use GPS to help match you with nearby {selectedRole === 'driver' ? 'passengers' : 'drivers'} & routes</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-900 mb-2">🔒 Why we need this:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Find {selectedRole === 'driver' ? 'passengers' : 'drivers'} near you</li>
                <li>• Auto-fill pickup locations</li>
                <li>• Show accurate distances & times</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={requestLocationPermission}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3 hover-scale"
              >
                <Navigation className="w-5 h-5 mr-2" />
                Allow Location Access
              </Button>
              
              <Button 
                variant="outline" 
                onClick={skipLocation}
                className="w-full"
              >
                Skip for now
              </Button>
            </div>

            {/* PWA Install Prompt */}
            {showPWAPrompt && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200 animate-fade-in">
                <div className="flex items-center mb-2">
                  <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-purple-900">📥 Install App</h3>
                </div>
                <p className="text-sm text-purple-700 mb-3">Add Kigali Ride to your home screen for quick access</p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Install
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowPWAPrompt(false)}>
                    Later
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default WelcomeLanding;
