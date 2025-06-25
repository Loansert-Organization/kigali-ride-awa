
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Bell, 
  Navigation, 
  Home, 
  Church, 
  ShoppingBag, 
  Edit3,
  Gift,
  Rocket,
  Check
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

// Language translations
const translations = {
  en: {
    welcome: "👋 Welcome! Let's set up your ride experience.",
    useLocation: "📍 Use My Location", 
    fallbackText: "You can still enter pickup manually during booking.",
    enableNotifications: "🔔 Enable Notifications",
    notificationDesc: "We'll notify you when your driver is confirmed.",
    notificationFallback: "You can also get updates via WhatsApp.",
    whereHeaded: "Where are you headed today?",
    home: "🏠 Home",
    church: "⛪ Church", 
    market: "🛍️ Market",
    other: "📝 Other",
    enterAddress: "Enter address...",
    promoJoining: "You're joining via",
    enterPromo: "Enter promo code",
    promoPlaceholder: "RIDE-XXXXX",
    continueApp: "🚀 Continue to App",
    locationEnabled: "Location Enabled",
    locationSuccess: "Location access granted successfully",
    locationDenied: "Location Access Denied", 
    locationDeniedDesc: "You can enter addresses manually instead",
    notificationsEnabled: "Notifications Enabled",
    notificationsSuccess: "You'll receive ride updates",
    notificationsDenied: "Notifications Disabled",
    notificationsDeniedDesc: "You can still get updates via WhatsApp"
  },
  kn: {
    welcome: "👋 Murakaza neza! Reka duteganye urugendo rwawe.",
    useLocation: "📍 Koresha Aho Ndi",
    fallbackText: "Urashobora kwandika aho uzafatwa mu rugendo.", 
    enableNotifications: "🔔 Emera Ubutumwa",
    notificationDesc: "Tuzakumenyesha iyo mushoferi wawe yemeje.",
    notificationFallback: "Urashobora nanone kubona amakuru kuri WhatsApp.",
    whereHeaded: "Ujya he uyu munsi?",
    home: "🏠 Mu rugo",
    church: "⛪ Ku rusengero",
    market: "🛍️ Ku isoko", 
    other: "📝 Ikindi",
    enterAddress: "Andika aderesi...",
    promoJoining: "Winjiye ukoresheje",
    enterPromo: "Andika kode y'ibiciro",
    promoPlaceholder: "RIDE-XXXXX",
    continueApp: "🚀 Komeza ku rugendo",
    locationEnabled: "Aho Uri Byemewe",
    locationSuccess: "Kwemera aho uri byakunze neza",
    locationDenied: "Aho Uri Byanze",
    locationDeniedDesc: "Urashobora kwandika aderesi mu buryo bwa kimwe",
    notificationsEnabled: "Ubutumwa Bwemewe", 
    notificationsSuccess: "Uzabona amakuru y'urugendo",
    notificationsDenied: "Ubutumwa Bwanze",
    notificationsDeniedDesc: "Urashobora kubona amakuru kuri WhatsApp"
  },
  fr: {
    welcome: "👋 Bienvenue! Configurons votre expérience de voyage.",
    useLocation: "📍 Utiliser Ma Position",
    fallbackText: "Vous pouvez toujours entrer manuellement le lieu de prise en charge.",
    enableNotifications: "🔔 Activer les Notifications", 
    notificationDesc: "Nous vous notifierons quand votre chauffeur sera confirmé.",
    notificationFallback: "Vous pouvez aussi recevoir des mises à jour via WhatsApp.",
    whereHeaded: "Où allez-vous aujourd'hui?",
    home: "🏠 Maison",
    church: "⛪ Église",
    market: "🛍️ Marché",
    other: "📝 Autre",
    enterAddress: "Entrez l'adresse...",
    promoJoining: "Vous rejoignez via",
    enterPromo: "Entrez le code promo",
    promoPlaceholder: "RIDE-XXXXX", 
    continueApp: "🚀 Continuer vers l'App",
    locationEnabled: "Localisation Activée",
    locationSuccess: "Accès à la localisation accordé avec succès",
    locationDenied: "Accès à la Localisation Refusé",
    locationDeniedDesc: "Vous pouvez entrer les adresses manuellement",
    notificationsEnabled: "Notifications Activées",
    notificationsSuccess: "Vous recevrez les mises à jour de trajet", 
    notificationsDenied: "Notifications Désactivées",
    notificationsDeniedDesc: "Vous pouvez toujours recevoir des mises à jour via WhatsApp"
  }
};

const PassengerOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'en' | 'kn' | 'fr'>('en');
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [existingPromo, setExistingPromo] = useState('');

  const t = translations[language];

  useEffect(() => {
    // Get stored language and promo
    const storedLang = localStorage.getItem('language') as 'en' | 'kn' | 'fr';
    const storedPromo = localStorage.getItem('promo_code');
    
    if (storedLang) setLanguage(storedLang);
    if (storedPromo) setExistingPromo(storedPromo);
  }, []);

  const requestLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        });
      });
      
      setLocationGranted(true);
      localStorage.setItem('location_granted', 'true');
      localStorage.setItem('user_location', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      }));
      
      toast({
        title: t.locationEnabled,
        description: t.locationSuccess,
      });
      
      // Update Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('users').upsert({
            auth_user_id: user.id,
            location_enabled: true
          });
        }
      } catch (error) {
        console.error('Error updating location in Supabase:', error);
      }
      
      setTimeout(() => setCurrentStep(1), 500);
    } catch (error) {
      toast({
        title: t.locationDenied,
        description: t.locationDeniedDesc,
        variant: "destructive"
      });
      setTimeout(() => setCurrentStep(1), 1000);
    }
  };

  const requestNotifications = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsGranted(true);
        localStorage.setItem('notifications_granted', 'true');
        toast({
          title: t.notificationsEnabled,
          description: t.notificationsSuccess,
        });
      } else {
        toast({
          title: t.notificationsDenied,
          description: t.notificationsDeniedDesc,
          variant: "destructive"
        });
      }
      setTimeout(() => setCurrentStep(2), 500);
    } catch (error) {
      toast({
        title: t.notificationsDenied,
        description: t.notificationsDeniedDesc,
        variant: "destructive"
      });
      setTimeout(() => setCurrentStep(2), 1000);
    }
  };

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    if (destination !== 'other') {
      localStorage.setItem('smart_suggestion', destination);
      setTimeout(() => setCurrentStep(3), 500);
    }
  };

  const handleCustomAddress = () => {
    if (customAddress.trim()) {
      localStorage.setItem('smart_suggestion', customAddress);
      setTimeout(() => setCurrentStep(3), 500);
    }
  };

  const handlePromoSubmit = () => {
    if (promoCode.trim() && promoCode.startsWith('RIDE-') && promoCode.length >= 6) {
      localStorage.setItem('promo_code', promoCode);
      setExistingPromo(promoCode);
    }
    finishOnboarding();
  };

  const finishOnboarding = async () => {
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">{t.useLocation}</h2>
                <p className="text-gray-600 mt-2">{t.fallbackText}</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={requestLocation} 
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  {t.useLocation}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(1)} 
                  className="w-full"
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">{t.enableNotifications}</h2>
                <p className="text-gray-600 mt-2">{t.notificationDesc}</p>
                <p className="text-sm text-gray-500 mt-1">{t.notificationFallback}</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={requestNotifications} 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                >
                  <Bell className="w-5 h-5 mr-2" />
                  {t.enableNotifications}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)} 
                  className="w-full"
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">{t.whereHeaded}</h2>
                <p className="text-gray-600 mt-2">Help us suggest better routes</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant={selectedDestination === 'home' ? "default" : "outline"}
                  onClick={() => handleDestinationSelect('home')} 
                  className="w-full justify-start py-3"
                >
                  <Home className="w-5 h-5 mr-3" />
                  {t.home}
                </Button>
                
                <Button 
                  variant={selectedDestination === 'church' ? "default" : "outline"}
                  onClick={() => handleDestinationSelect('church')} 
                  className="w-full justify-start py-3"
                >
                  <Church className="w-5 h-5 mr-3" />
                  {t.church}
                </Button>
                
                <Button 
                  variant={selectedDestination === 'market' ? "default" : "outline"}
                  onClick={() => handleDestinationSelect('market')} 
                  className="w-full justify-start py-3"
                >
                  <ShoppingBag className="w-5 h-5 mr-3" />
                  {t.market}
                </Button>
                
                <Button 
                  variant={selectedDestination === 'other' ? "default" : "outline"}
                  onClick={() => handleDestinationSelect('other')} 
                  className="w-full justify-start py-3"
                >
                  <Edit3 className="w-5 h-5 mr-3" />
                  {t.other}
                </Button>

                {selectedDestination === 'other' && (
                  <div className="space-y-2 animate-fade-in">
                    <Input
                      type="text"
                      placeholder={t.enterAddress}
                      value={customAddress}
                      onChange={(e) => setCustomAddress(e.target.value)}
                      className="w-full"
                    />
                    <Button 
                      onClick={handleCustomAddress}
                      disabled={!customAddress.trim()}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                )}

                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentStep(3)} 
                  className="w-full mt-4"
                >
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Gift className="w-8 h-8 text-purple-600" />
                </div>
                
                {existingPromo ? (
                  <div>
                    <h2 className="text-xl font-semibold text-green-700">{t.promoJoining}</h2>
                    <div className="text-2xl font-bold text-green-600 mt-2 flex items-center justify-center">
                      <Check className="w-6 h-6 mr-2" />
                      {existingPromo}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">Got a promo code?</h2>
                    <p className="text-gray-600 mt-2">Enter it to unlock rewards</p>
                  </div>
                )}
              </div>
              
              {!existingPromo && (
                <div className="space-y-3 mb-4">
                  <Input
                    type="text"
                    placeholder={t.promoPlaceholder}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="w-full text-center font-mono"
                    maxLength={10}
                  />
                </div>
              )}
              
              <Button 
                onClick={handlePromoSubmit}
                className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 py-3"
              >
                <Rocket className="w-5 h-5 mr-2" />
                {t.continueApp}
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-center space-x-2 mb-4">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentStep >= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {t.welcome}
          </h1>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default PassengerOnboarding;
