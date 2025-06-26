
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import { RoleSelector } from "@/components/common/RoleSelector";
import { MapPin, Users, TrendingUp, Globe, User, Car, Star } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, guestRole, setGuestRole } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
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

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  const handleRoleSelect = (role: 'passenger' | 'driver') => {
    setGuestRole(role);
    
    // Navigate based on role
    if (role === 'passenger') {
      navigate('/home/passenger');
    } else {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
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

        {/* Quick Actions */}
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

        {!guestRole && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowRoleSelector(true)}
              className="text-purple-600"
            >
              Tell us what you're looking for →
            </Button>
          </div>
        )}

        {/* Feature Cards - Always visible for guest browsing */}
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

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-6 space-y-2">
          <p>🇷🇼 Made for Kigali • Secure WhatsApp Login</p>
          <div className="flex items-center justify-center space-x-4">
            <span>🌟 No signup walls</span>
            <span>🔒 Guest browsing</span>
            <span>⚡ Just-in-time auth</span>
          </div>
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
    </div>
  );
};

export default Index;
