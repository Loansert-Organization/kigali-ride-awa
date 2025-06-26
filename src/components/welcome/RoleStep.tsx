
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car, User, Gift } from 'lucide-react';

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
  selectedRole,
  urlPromo,
  showPromoInput,
  setShowPromoInput,
  promoCode,
  setPromoCode
}) => {
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
              onClick={() => onRoleSelect('driver')}
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
              onClick={() => onRoleSelect('passenger')}
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
};

export default RoleStep;
