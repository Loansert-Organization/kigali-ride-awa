
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Car, User, Gift, Globe, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

const languages = {
  en: {
    welcome: "Welcome to Kigali Ride",
    subtitle: "Your trusted ride booking platform",
    selectRole: "How would you like to use our platform?",
    driver: "I'm a Driver",
    passenger: "I'm a Passenger",
    driverDesc: "Earn money by offering rides",
    passengerDesc: "Book affordable rides instantly",
    promoTitle: "Have a promo code?",
    promoPlaceholder: "Enter promo code",
    promoJoining: "You're joining via",
    locationTitle: "Enable Location",
    locationDesc: "Allow location access for better ride matching",
    enableLocation: "Enable Location",
    skipLocation: "Skip for now",
    legalNotice: "By continuing, you agree to our Terms of Service and Privacy Policy",
    continue: "Continue",
    languageSelect: "Select Language"
  },
  kn: {
    welcome: "Murakaza neza kuri Kigali Ride",
    subtitle: "Urubuga rwacu rwizewe rwo gutumiza modoka",
    selectRole: "Ni ukuntu ugomba gukoresha urubuga rwacu?",
    driver: "Ndi Umushoferi",
    passenger: "Ndi Umugenzi",
    driverDesc: "Injiza amafaranga utanga ingendo",
    passengerDesc: "Tumiza ingendo zihendutse ako kanya",
    promoTitle: "Ufite kode ya promo?",
    promoPlaceholder: "Injiza kode ya promo",
    promoJoining: "Urinjira ukoresheje",
    locationTitle: "Emera Aho Uri",
    locationDesc: "Emerera gukoresha aho uri kugira ngo tuvugurure neza",
    enableLocation: "Emera Aho Uri",
    skipLocation: "Simbuka iki gihe",
    legalNotice: "Ukomeje, wemera amabwiriza yacu n'amategeko y'ubuzima bwawe",
    continue: "Komeza",
    languageSelect: "Hitamo Ururimi"
  },
  fr: {
    welcome: "Bienvenue sur Kigali Ride",
    subtitle: "Votre plateforme de réservation de course de confiance",
    selectRole: "Comment souhaitez-vous utiliser notre plateforme?",
    driver: "Je suis Chauffeur",
    passenger: "Je suis Passager",
    driverDesc: "Gagnez de l'argent en proposant des courses",
    passengerDesc: "Réservez des courses abordables instantanément",
    promoTitle: "Avez-vous un code promo?",
    promoPlaceholder: "Entrez le code promo",
    promoJoining: "Vous rejoignez via",
    locationTitle: "Activer la Localisation",
    locationDesc: "Autorisez l'accès à la localisation pour un meilleur appariement",
    enableLocation: "Activer la Localisation",
    skipLocation: "Passer pour maintenant",
    legalNotice: "En continuant, vous acceptez nos Conditions d'Utilisation et Politique de Confidentialité",
    continue: "Continuer",
    languageSelect: "Choisir la Langue"
  }
};

const Index = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'kn' | 'fr'>('en');
  const [selectedRole, setSelectedRole] = useState<'driver' | 'passenger' | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [urlPromo, setUrlPromo] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [currentStep, setCurrentStep] = useState<'role' | 'promo' | 'location' | 'continue'>('role');

  const t = languages[selectedLanguage];

  useEffect(() => {
    // Check for promo code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const promo = urlParams.get('promo');
    if (promo) {
      setUrlPromo(promo);
      setPromoCode(promo);
      localStorage.setItem('promo_code', promo);
    }

    // Check saved language preference
    const savedLanguage = localStorage.getItem('language') as 'en' | 'kn' | 'fr';
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
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

  const handleRoleSelect = (role: 'driver' | 'passenger') => {
    setSelectedRole(role);
    localStorage.setItem('user_role', role);
    setCurrentStep('promo');
    toast({
      title: "Role Selected",
      description: `You selected: ${role === 'driver' ? 'Driver' : 'Passenger'}`,
    });
  };

  const handlePromoSubmit = () => {
    if (promoCode.trim()) {
      localStorage.setItem('promo_code', promoCode.trim());
      toast({
        title: "Promo Code Applied",
        description: `Code "${promoCode}" has been saved`,
      });
    }
    setCurrentStep('location');
  };

  const requestLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setLocationGranted(true);
      localStorage.setItem('location_granted', 'true');
      localStorage.setItem('user_location', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }));
      toast({
        title: "Location Enabled",
        description: "Location access granted successfully",
      });
      setCurrentStep('continue');
    } catch (error) {
      toast({
        title: "Location Denied",
        description: "You can enter addresses manually instead",
        variant: "destructive"
      });
      setCurrentStep('continue');
    }
  };

  const handleContinue = () => {
    const userData = {
      role: selectedRole,
      language: selectedLanguage,
      promo_code: promoCode || urlPromo,
      location_granted: locationGranted
    };
    
    // Save to localStorage
    Object.entries(userData).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value.toString());
    });

    // In a real app, this would redirect to onboarding
    toast({
      title: "Welcome!",
      description: `Redirecting to ${selectedRole} onboarding...`,
    });
    
    // Simulate redirect
    setTimeout(() => {
      window.location.href = `/onboarding/${selectedRole}`;
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-yellow-400 rounded-full"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-green-400 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Car className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.welcome}</h1>
          <p className="text-blue-100">{t.subtitle}</p>
          
          {/* Language selector button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLanguageSelector(true)}
            className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            <Globe className="w-4 h-4 mr-2" />
            {selectedLanguage.toUpperCase()}
          </Button>
        </div>

        {/* Language Selector Modal */}
        {showLanguageSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{t.languageSelect}</h3>
                <div className="space-y-2">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'kn', name: 'Kinyarwanda' },
                    { code: 'fr', name: 'Français' }
                  ].map((lang) => (
                    <Button
                      key={lang.code}
                      variant={selectedLanguage === lang.code ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => handleLanguageChange(lang.code as 'en' | 'kn' | 'fr')}
                    >
                      {selectedLanguage === lang.code && <Check className="w-4 h-4 mr-2" />}
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Role Selection */}
          {currentStep === 'role' && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-center mb-6">{t.selectRole}</h2>
                <div className="space-y-4">
                  <Button
                    onClick={() => handleRoleSelect('driver')}
                    className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center w-full">
                      <Car className="w-6 h-6 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">{t.driver}</div>
                        <div className="text-sm text-blue-100">{t.driverDesc}</div>
                      </div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleRoleSelect('passenger')}
                    className="w-full h-20 bg-purple-600 hover:bg-purple-700 text-white relative overflow-hidden group"
                  >
                    <div className="flex items-center justify-center w-full">
                      <User className="w-6 h-6 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">{t.passenger}</div>
                        <div className="text-sm text-purple-100">{t.passengerDesc}</div>
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Promo Code Step */}
          {currentStep === 'promo' && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <Gift className="w-12 h-12 mx-auto text-orange-500 mb-2" />
                  <h2 className="text-xl font-semibold">{t.promoTitle}</h2>
                </div>
                
                {urlPromo ? (
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-2">{t.promoJoining}</p>
                    <p className="text-2xl font-bold text-orange-500 mb-4">RIDE-{urlPromo}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder={t.promoPlaceholder}
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                <Button onClick={handlePromoSubmit} className="w-full">
                  {t.continue}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Location Permission Step */}
          {currentStep === 'location' && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <MapPin className="w-12 h-12 mx-auto text-green-500 mb-2" />
                  <h2 className="text-xl font-semibold">{t.locationTitle}</h2>
                  <p className="text-gray-600 mt-2">{t.locationDesc}</p>
                </div>
                
                <div className="space-y-3">
                  <Button onClick={requestLocation} className="w-full bg-green-600 hover:bg-green-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    {t.enableLocation}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep('continue')} 
                    className="w-full"
                  >
                    {t.skipLocation}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Continue Step */}
          {currentStep === 'continue' && (
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold">All Set!</h2>
                  <p className="text-gray-600 mt-2">Ready to start your journey</p>
                </div>

                <div className="text-xs text-gray-500 text-center mb-4">
                  {t.legalNotice}
                </div>

                <Button onClick={handleContinue} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {t.continue}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {['role', 'promo', 'location', 'continue'].map((step, index) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${
                ['role', 'promo', 'location', 'continue'].indexOf(currentStep) >= index
                  ? 'bg-white'
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
