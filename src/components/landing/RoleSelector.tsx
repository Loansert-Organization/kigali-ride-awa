
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, User } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PromoCodeSection from './PromoCodeSection';

interface RoleSelectorProps {
  selectedLanguage: 'en' | 'kn' | 'fr';
  promoCode: string;
  setPromoCode: (code: string) => void;
  urlPromo: string;
  setCurrentStep: (step: 'welcome' | 'role' | 'location' | 'final') => void;
  t: any;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedLanguage,
  promoCode,
  setPromoCode,
  urlPromo,
  setCurrentStep,
  t
}) => {
  const handleRoleSelect = async (role: 'driver' | 'passenger') => {
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

  return (
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

        <PromoCodeSection
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          urlPromo={urlPromo}
          t={t}
        />
      </CardContent>
    </Card>
  );
};

export default RoleSelector;
