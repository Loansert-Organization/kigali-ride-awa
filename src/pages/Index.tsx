
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { RoleSelector } from "@/components/common/RoleSelector";
import { LocationPermissionModal } from "@/components/modals/LocationPermissionModal";
import { MapPin, Users, TrendingUp, Globe, User, Car, Star, Navigation, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, guestRole, setGuestRole } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('preferred_language') || 'en';
  });

  // Show language selector on first visit
  useEffect(() => {
    const hasSeenLanguageSelector = localStorage.getItem('has_seen_language_selector');
    if (!hasSeenLanguageSelector) {
      setShowLanguageSelector(true);
      localStorage.setItem('has_seen_language_selector', 'true');
    }
  }, []);

  // Auto-navigate authenticated users with roles
  useEffect(() => {
    if (isAuthenticated && userProfile?.role) {
      if (userProfile.role === 'passenger') {
        navigate('/home/passenger');
      } else if (userProfile.role === 'driver') {
        navigate('/home/driver');
      }
    }
  }, [isAuthenticated, userProfile, navigate]);

  // PWA Install Prompt Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setTimeout(() => setShowPWAPrompt(true), 5000);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('preferred_language', language);
    toast({
      title: "Language updated",
      description: `Language changed to ${getLanguageName(language)}`,
    });
  };

  const handleRoleSelect = (role: 'passenger' | 'driver') => {
    setGuestRole(role);
    localStorage.setItem('user_role', role);
    
    toast({
      title: "Role selected!",
      description: `Welcome as a ${role}! 🎉`,
    });

    // Show location permission after role selection
    setShowLocationPermission(true);
  };

  const handleLocationGranted = (position: GeolocationPosition) => {
    localStorage.setItem('location_granted', 'true');
    localStorage.setItem('user_location', JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: Date.now()
    }));
    
    toast({
      title: "Location enabled! 📍",
      description: "Perfect! Now we can find rides near you",
    });

    navigateToHome();
  };

  const handleLocationDenied = () => {
    toast({
      title: "Location access denied",
      description: "You can enter addresses manually instead",
    });
    navigateToHome();
  };

  const navigateToHome = () => {
    const role = guestRole || localStorage.getItem('user_role') as 'passenger' | 'driver';
    
    if (role === 'passenger') {
      navigate('/home/passenger');
    } else if (role === 'driver') {
      navigate('/home/driver');
    }
  };

  const getGreeting = () => {
    const greetings = {
      en: "Welcome to Kigali Ride",
      kn: "Murakaze kuri Kigali Ride", 
      fr: "Bienvenue sur Kigali Ride"
    };
    return greetings[selectedLanguage as keyof typeof greetings] || greetings.en;
  };

  const getSubtitle = () => {
    const subtitles = {
      en: "Your reliable ride-sharing companion in Kigali",
      kn: "Umunyanguga wawe w'ingenzi mu kugenda i Kigali",
      fr: "Votre compagnon de covoiturage fiable à Kigali"
    };
    return subtitles[selectedLanguage as keyof typeof subtitles] || subtitles.en;
  };

  const getLanguageName = (code: string) => {
    const names = { 
      en: 'English', 
      kn: 'Kinyarwanda', 
      fr: 'Français' 
    };
    return names[code as keyof typeof names] || 'English';
  };

  const getRoleSelectText = () => {
    const texts = {
      en: "I want to...",
      kn: "Ndashaka...",
      fr: "Je veux..."
    };
    return texts[selectedLanguage as keyof typeof texts] || texts.en;
  };

  const getDriverText = () => {
    const texts = {
      en: { title: "Offer Rides", subtitle: "Post trips and earn money" },
      kn: { title: "Gutanga Ingendo", subtitle: "Shyira ingendo kandi wunguke amafaranga" },
      fr: { title: "Offrir des Trajets", subtitle: "Publier des trajets et gagner de l'argent" }
    };
    return texts[selectedLanguage as keyof typeof texts] || texts.en;
  };

  const getPassengerText = () => {
    const texts = {
      en: { title: "Book a Ride", subtitle: "Find drivers going your way" },
      kn: { title: "Gusaba Ingendo", subtitle: "Shakisha abashoferi bagiye mu nzira yawe" },
      fr: { title: "Réserver un Trajet", subtitle: "Trouver des conducteurs allant dans votre direction" }
    };
    return texts[selectedLanguage as keyof typeof texts] || texts.en;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* HeaderBlock - App logo + welcome text */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Kigali Ride</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLanguageSelector(true)}
              >
                <Globe className="w-4 h-4" />
              </Button>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">{getGreeting()}</h2>
          <p className="text-gray-600">{getSubtitle()}</p>
          
          {isAuthenticated && userProfile && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Authenticated with WhatsApp • {userProfile.promo_code}
              </p>
            </div>
          )}
          
          {!isAuthenticated && guestRole && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                👋 Browsing as {guestRole === 'passenger' ? 'Passenger' : 'Driver'} • 
                Login with WhatsApp to book rides
              </p>
            </div>
          )}
        </div>

        {/* RoleSelectorBlock - Core functionality for profile selection */}
        {!guestRole && !userProfile?.role && (
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-purple-900 mb-4">
                {getRoleSelectText()}
              </h3>
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleRoleSelect('driver')}
                  className="w-full h-16 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-3"
                >
                  <Car className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold text-lg">🚗 {getDriverText().title}</div>
                    <div className="text-sm opacity-90">{getDriverText().subtitle}</div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleRoleSelect('passenger')}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-3"
                >
                  <User className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-semibold text-lg">🧍 {getPassengerText().title}</div>
                    <div className="text-sm opacity-90">{getPassengerText().subtitle}</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions - Only show after role is selected */}
        {(guestRole || userProfile?.role) && (
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/book-ride')}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-3"
            >
              <User className="w-5 h-5" />
              <span className="font-semibold">Book a Ride</span>
            </Button>

            <Button
              onClick={() => navigate('/home/driver')}
              variant="outline"
              className="w-full h-14 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 flex items-center justify-center space-x-3"
            >
              <Car className="w-5 h-5" />
              <span className="font-semibold">Offer Rides</span>
            </Button>
          </div>
        )}

        {/* Feature Cards - Show for all users */}
        <div className="grid grid-cols-1 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/leaderboard')}
          >
            <CardContent className="p-4 flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Leaderboard & Rewards</h3>
                <p className="text-sm text-gray-600">See top referrers and earn points</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Live Trip Map</h3>
                <p className="text-sm text-gray-600">View active drivers and routes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Community Stats</h3>
                <p className="text-sm text-gray-600">Rides, drivers, and growth metrics</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PWAInstallPromptBlock */}
        {showPWAPrompt && (
          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-purple-900">Install App</h4>
                    <p className="text-sm text-purple-700">Add to home screen for quick access</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Install
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowPWAPrompt(false)}>
                    Later
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LegalNoticeBlock */}
        <div className="text-center text-xs text-gray-500 pt-6 space-y-2">
          <p>🇷🇼 Made for Kigali • Secure WhatsApp Login</p>
          <div className="flex items-center justify-center space-x-4">
            <span>🌟 No signup walls</span>
            <span>🔒 Guest browsing</span>
            <span>⚡ Just-in-time auth</span>
          </div>
          <p className="mt-3 text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>

      {/* Modals */}
      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onLanguageSelect={handleLanguageSelect}
        selectedLanguage={selectedLanguage}
      />

      <RoleSelector
        isOpen={showRoleSelector}
        onClose={() => setShowRoleSelector(false)}
        onRoleSelect={handleRoleSelect}
        selectedRole={guestRole}
      />

      <LocationPermissionModal
        isOpen={showLocationPermission}
        onClose={() => setShowLocationPermission(false)}
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    </div>
  );
};

export default Index;
