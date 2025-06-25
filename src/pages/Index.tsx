
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Car, User, Gift, Globe, Check, Sparkles, Navigation, Star } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const languages = {
  en: {
    appName: "Kigali Ride",
    welcome: "Welcome to Kigali Ride",
    subtitle: "A smarter way to get around",
    tagline: "Connect with trusted drivers instantly",
    selectRole: "What brings you here today?",
    driver: "I'm a Driver",
    passenger: "I'm a Passenger",
    driverDesc: "Earn money by offering rides to passengers",
    passengerDesc: "Find affordable rides with trusted drivers",
    promoTitle: "Have a promo code?",
    promoPlaceholder: "Enter promo code",
    promoJoining: "🎉 You're joining via",
    locationTitle: "Enable Location Services",
    locationDesc: "Help us connect you with nearby drivers and optimize your routes",
    enableLocation: "Allow Location Access",
    skipLocation: "Skip for now",
    legalNotice: "By continuing, you agree to our Terms of Service and Privacy Policy",
    continue: "Get Started",
    languageSelect: "Choose Language",
    installApp: "Install App",
    installDesc: "Add Kigali Ride to your home screen for quick access",
    benefits: {
      fast: "Fast & Reliable",
      safe: "Safe & Trusted",
      affordable: "Affordable Rates"
    }
  },
  kn: {
    appName: "Kigali Ride",
    welcome: "Murakaza neza kuri Kigali Ride",
    subtitle: "Uburyo bwiza bwo kugenda",
    tagline: "Huza n'abashoferi bizewe ako kanya",
    selectRole: "Ni iki cyangwa uwagiye kuri uyu munsi?",
    driver: "Ndi Umushoferi",
    passenger: "Ndi Umugenzi",
    driverDesc: "Injiza amafaranga utanga ingendo ku bagenzi",
    passengerDesc: "Shakisha ingendo zihendutse n'abashoferi bizewe",
    promoTitle: "Ufite kode ya promo?",
    promoPlaceholder: "Injiza kode ya promo",
    promoJoining: "🎉 Urinjira ukoresheje",
    locationTitle: "Emera Serivisi z'Aho Uri",
    locationDesc: "Dufashe kuguhuriza n'abashoferi bari hafi yawe no gutegura inzira zawe",
    enableLocation: "Emera Gukoresha Aho Uri",
    skipLocation: "Simbuka iki gihe",
    legalNotice: "Ukomeje, wemera amabwiriza yacu n'amategeko y'ubuzima bwawe",
    continue: "Tangira",
    languageSelect: "Hitamo Ururimi",
    installApp: "Shyiramo Porogaramu",
    installDesc: "Shyira Kigali Ride ku rupapuro rwawe rw'ibanze kugira ngo uyishobore gukoresha vuba",
    benefits: {
      fast: "Byihuse & Byizewe",
      safe: "Byumvikane & Byizewe",
      affordable: "Ibiciro Byoroshye"
    }
  },
  fr: {
    appName: "Kigali Ride",
    welcome: "Bienvenue sur Kigali Ride",
    subtitle: "Une façon plus intelligente de se déplacer",
    tagline: "Connectez-vous instantanément avec des chauffeurs de confiance",
    selectRole: "Qu'est-ce qui vous amène ici aujourd'hui?",
    driver: "Je suis Chauffeur",
    passenger: "Je suis Passager",
    driverDesc: "Gagnez de l'argent en proposant des courses aux passagers",
    passengerDesc: "Trouvez des courses abordables avec des chauffeurs de confiance",
    promoTitle: "Avez-vous un code promo?",
    promoPlaceholder: "Entrez le code promo",
    promoJoining: "🎉 Vous rejoignez via",
    locationTitle: "Activer les Services de Localisation",
    locationDesc: "Aidez-nous à vous connecter avec les chauffeurs à proximité et à optimiser vos itinéraires",
    enableLocation: "Autoriser l'Accès à la Localisation",
    skipLocation: "Passer pour maintenant",
    legalNotice: "En continuant, vous acceptez nos Conditions d'Utilisation et Politique de Confidentialité",
    continue: "Commencer",
    languageSelect: "Choisir la Langue",
    installApp: "Installer l'App",
    installDesc: "Ajoutez Kigali Ride à votre écran d'accueil pour un accès rapide",
    benefits: {
      fast: "Rapide & Fiable",
      safe: "Sûr & Approuvé",
      affordable: "Tarifs Abordables"
    }
  }
};

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'kn' | 'fr'>('en');
  const [selectedRole, setSelectedRole] = useState<'driver' | 'passenger' | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [urlPromo, setUrlPromo] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'role' | 'location' | 'final'>('welcome');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const t = languages[selectedLanguage];

  useEffect(() => {
    // Check for existing preferences
    const savedLanguage = localStorage.getItem('language') as 'en' | 'kn' | 'fr';
    const savedRole = localStorage.getItem('user_role') as 'driver' | 'passenger';
    
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }

    if (savedRole) {
      // Redirect existing users
      window.location.href = `/onboarding/${savedRole}`;
      return;
    }

    // Check for promo code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const promo = urlParams.get('promo');
    if (promo) {
      setUrlPromo(promo);
      setPromoCode(promo);
      localStorage.setItem('promo_code', promo);
    }

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPWAPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLanguageChange = (lang: 'en' | 'kn' | 'fr') => {
    setSelectedLanguage(lang);
    localStorage.setItem('language', lang);
    setShowLanguageSelector(false);
    toast({
      title: "Language Updated",
      description: `Language changed to ${lang === 'en' ? 'English' : lang === 'kn' ? 'Kinyarwanda' : 'Français'}`,
    });
  };

  const handleRoleSelect = async (role: 'driver' | 'passenger') => {
    setSelectedRole(role);
    
    // Create anonymous user session if needed
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await supabase.auth.signInAnonymously();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }

    // Save to localStorage
    localStorage.setItem('user_role', role);
    localStorage.setItem('language', selectedLanguage);
    
    if (promoCode) {
      localStorage.setItem('promo_code', promoCode);
    }

    setCurrentStep('location');
    
    toast({
      title: "Role Selected",
      description: `You selected: ${role === 'driver' ? t.driver : t.passenger}`,
    });
  };

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
        title: "Location Enabled",
        description: "Location access granted successfully",
      });
      
      setCurrentStep('final');
    } catch (error) {
      toast({
        title: "Location Access Denied",
        description: "You can enter addresses manually instead",
        variant: "destructive"
      });
      setCurrentStep('final');
    }
  };

  const handleContinue = () => {
    // Final redirect to onboarding
    if (selectedRole) {
      toast({
        title: `Welcome to Kigali Ride!`,
        description: `Setting up your ${selectedRole} experience...`,
      });
      
      setTimeout(() => {
        window.location.href = `/onboarding/${selectedRole}`;
      }, 1500);
    }
  };

  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({
          title: "App Installed!",
          description: "Kigali Ride has been added to your home screen",
        });
      }
      setDeferredPrompt(null);
      setShowPWAPrompt(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-green-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-pink-400 rounded-full animate-ping"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-md">
        {/* Header with App Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
            <Car className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{t.appName}</h1>
          <p className="text-xl text-blue-100 mb-1">{t.subtitle}</p>
          <p className="text-sm text-blue-200">{t.tagline}</p>
          
          {/* Language selector button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLanguageSelector(true)}
            className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
          >
            <Globe className="w-4 h-4 mr-2" />
            {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'kn' ? 'Kinyarwanda' : 'Français'}
          </Button>
        </div>

        {/* Benefits Preview */}
        {currentStep === 'welcome' && (
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white">{t.benefits.fast}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white">{t.benefits.safe}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white">{t.benefits.affordable}</p>
              </div>
            </div>
            
            <Card className="bg-white/95 backdrop-blur-sm mb-4">
              <CardContent className="p-6 text-center">
                <h2 className="text-xl font-semibold mb-4">{t.selectRole}</h2>
                <Button
                  onClick={() => setCurrentStep('role')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {t.continue}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Language Selector Modal */}
        {showLanguageSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm animate-scale-in">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t.languageSelect}</h3>
                <div className="space-y-2">
                  {[
                    { code: 'en', name: 'English', flag: '🇺🇸' },
                    { code: 'kn', name: 'Kinyarwanda', flag: '🇷🇼' },
                    { code: 'fr', name: 'Français', flag: '🇫🇷' }
                  ].map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleLanguageChange(lang.code as 'en' | 'kn' | 'fr')}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      {selectedLanguage === lang.code && <Check className="w-4 h-4 mr-2" />}
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Role Selection */}
        {currentStep === 'role' && (
          <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-center mb-6">{t.selectRole}</h2>
              <div className="space-y-4">
                <Button
                  onClick={() => handleRoleSelect('driver')}
                  className="w-full h-24 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white relative overflow-hidden group transform transition-transform hover:scale-105"
                >
                  <div className="flex items-center justify-center w-full">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <Car className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">{t.driver}</div>
                      <div className="text-sm text-blue-100">{t.driverDesc}</div>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleRoleSelect('passenger')}
                  className="w-full h-24 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white relative overflow-hidden group transform transition-transform hover:scale-105"
                >
                  <div className="flex items-center justify-center w-full">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg">{t.passenger}</div>
                      <div className="text-sm text-purple-100">{t.passengerDesc}</div>
                    </div>
                  </div>
                </Button>
              </div>

              {/* Promo Code Section */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                {urlPromo ? (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Gift className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <p className="text-green-700 font-medium">{t.promoJoining}</p>
                    <p className="text-2xl font-bold text-green-600">RIDE-{urlPromo}</p>
                  </div>
                ) : (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPromoInput(!showPromoInput)}
                      className="w-full mb-2"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {t.promoTitle}
                    </Button>
                    {showPromoInput && (
                      <input
                        type="text"
                        placeholder={t.promoPlaceholder}
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono"
                        maxLength={10}
                      />
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Permission */}
        {currentStep === 'location' && (
          <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">{t.locationTitle}</h2>
                <p className="text-gray-600 mt-2">{t.locationDesc}</p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={requestLocation} 
                  className="w-full bg-green-600 hover:bg-green-700 py-3"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  {t.enableLocation}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('final')} 
                  className="w-full"
                >
                  {t.skipLocation}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Step */}
        {currentStep === 'final' && (
          <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">🎉 All Set!</h2>
                <p className="text-gray-600 mt-2">Ready to start your Kigali Ride journey</p>
              </div>

              {/* PWA Install Prompt */}
              {showPWAPrompt && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-900">{t.installApp}</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">{t.installDesc}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handlePWAInstall}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Install
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPWAPrompt(false)}
                    >
                      Later
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 text-center mb-4">
                {t.legalNotice}
              </div>

              <Button 
                onClick={handleContinue} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-3 text-lg font-semibold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {t.continue}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {['welcome', 'role', 'location', 'final'].map((step, index) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                ['welcome', 'role', 'location', 'final'].indexOf(currentStep) >= index
                  ? 'bg-white shadow-lg'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
