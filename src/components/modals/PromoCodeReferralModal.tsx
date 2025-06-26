
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Users, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface PromoCodeReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPromoApplied?: (code: string) => void;
  mode: 'enter' | 'share';
}

export const PromoCodeReferralModal: React.FC<PromoCodeReferralModalProps> = ({
  isOpen,
  onClose,
  onPromoApplied,
  mode
}) => {
  const { userProfile } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Invalid code",
        description: "Please enter a valid promo code",
        variant: "destructive"
      });
      return;
    }

    onPromoApplied?.(promoCode.trim().toUpperCase());
    toast({
      title: "Promo code applied!",
      description: "You'll earn points when completing rides",
    });
    onClose();
  };

  const copyPromoCode = async () => {
    if (!userProfile?.promo_code) return;

    try {
      await navigator.clipboard.writeText(userProfile.promo_code);
      setCopied(true);
      toast({
        title: "Code copied!",
        description: "Share it with friends to earn rewards",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the code manually",
        variant: "destructive"
      });
    }
  };

  const shareViaWhatsApp = () => {
    if (!userProfile?.promo_code) return;
    
    const message = `🚗 Join me on Kigali Ride! Use my code ${userProfile.promo_code} when you sign up and we both earn rewards! Download: https://kigaliride.app`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-600" />
            {mode === 'enter' ? 'Enter Promo Code' : 'Invite Friends'}
          </DialogTitle>
        </DialogHeader>
        
        {mode === 'enter' ? (
          <div className="space-y-4">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-blue-500" />
              <h3 className="font-semibold mb-2">Got a Referral Code?</h3>
              <p className="text-sm text-gray-600">
                Enter a friend's code to earn bonus rewards on your first rides!
              </p>
            </div>

            <div className="space-y-3">
              <Input
                placeholder="Enter promo code (e.g., RIDE-ABC123)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="text-center font-mono"
              />

              <Button
                onClick={handleApplyPromo}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!promoCode.trim()}
              >
                Apply Code
              </Button>

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Gift className="w-12 h-12 mx-auto mb-3 text-green-500" />
              <h3 className="font-semibold mb-2">Share & Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Share your code with friends and earn points for every successful referral!
              </p>
            </div>

            {userProfile?.promo_code && (
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
                <div className="text-2xl font-bold text-purple-600 mb-3">
                  {userProfile.promo_code}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={copyPromoCode}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                  
                  <Button
                    onClick={shareViaWhatsApp}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    WhatsApp
                  </Button>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 space-y-1">
              <p>• Earn 1 point for each passenger referral</p>
              <p>• Earn 5 points for each driver referral</p>
              <p>• Top referrers get weekly rewards!</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
