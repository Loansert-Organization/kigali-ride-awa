import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, User, Gift, Loader2 } from 'lucide-react';

interface RoleStepProps {
  currentLang: { greeting: string };
  onRoleSelect: (role: 'passenger' | 'driver') => void;
  isProcessing: boolean;
  selectedRole: 'passenger' | 'driver' | null;
  urlPromo: string | null;
  showPromoInput: boolean;
  setShowPromoInput: (show: boolean) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
}

const RoleStep: React.FC<RoleStepProps> = ({
  currentLang,
  onRoleSelect,
  isProcessing,
  urlPromo,
  showPromoInput,
  setShowPromoInput,
  promoCode,
  setPromoCode
}) => {
  const handleRoleClick = (role: 'passenger' | 'driver') => {
    if (isProcessing) return;
    onRoleSelect(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-heading-1 text-gray-900 mb-2">
              {currentLang.greeting}
            </h1>
            <p className="text-body text-gray-600 mb-6">A smarter way to get around</p>
            <h2 className="text-heading-3 text-gray-800">👤 Choose your role to continue</h2>
          </div>

          <div className="space-y-4 mb-6">
            <Button 
              onClick={() => handleRoleClick('driver')}
              disabled={isProcessing}
              className="w-full h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                  <div className="text-left">
                    <div className="font-bold text-[18px]">Setting up...</div>
                    <div className="text-[15px] opacity-90 font-medium">Please wait</div>
                  </div>
                </>
              ) : (
                <>
                  <Car className="w-8 h-8 mr-3" />
                  <div className="text-left">
                    <div className="font-bold text-[18px]">🚗 I'm a Driver</div>
                    <div className="text-[15px] opacity-90 font-medium">Offer rides and earn money</div>
                  </div>
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => handleRoleClick('passenger')}
              disabled={isProcessing}
              className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-8 h-8 mr-3 animate-spin" />
                  <div className="text-left">
                    <div className="font-bold text-[18px]">Setting up...</div>
                    <div className="text-[15px] opacity-90 font-medium">Please wait</div>
                  </div>
                </>
              ) : (
                <>
                  <User className="w-8 h-8 mr-3" />
                  <div className="text-left">
                    <div className="font-bold text-[18px]">🧑🏾 I'm a Passenger</div>
                    <div className="text-[15px] opacity-90 font-medium">Book rides across Kigali</div>
                  </div>
                </>
              )}
            </Button>
          </div>

          {/* Promo Code Section */}
          {urlPromo ? (
            <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
              <Gift className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-green-700 font-semibold text-[17px]">Joining with promo code</p>
              <p className="text-2xl font-bold text-green-600">RIDE-{urlPromo}</p>
            </div>
          ) : (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPromoInput(!showPromoInput)}
                className="mb-2 font-semibold"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-[17px] font-medium"
                  maxLength={10}
                  disabled={isProcessing}
                />
              )}
            </div>
          )}

          {isProcessing && (
            <div className="text-center mt-4 text-[15px] text-gray-600 font-medium">
              <p>Setting up your account...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleStep;
