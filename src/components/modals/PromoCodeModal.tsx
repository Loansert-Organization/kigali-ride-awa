
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Share, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPromoCode?: string;
  onPromoCodeEnter?: (code: string) => void;
  mode: 'enter' | 'share';
}

export const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  isOpen,
  onClose,
  userPromoCode = '',
  onPromoCodeEnter,
  mode
}) => {
  const [enteredCode, setEnteredCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const handleEnterCode = async () => {
    if (!enteredCode.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (onPromoCodeEnter) {
        await onPromoCodeEnter(enteredCode);
      }
      toast({
        title: "Promo code applied!",
        description: "Welcome bonus activated",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Invalid code",
        description: "Please check and try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userPromoCode);
      setHasCopied(true);
      toast({
        title: "Copied!",
        description: "Your promo code has been copied",
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy manually",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    const shareText = `Join Kigali Ride and get bonus points! Use my promo code: ${userPromoCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kigali Ride Invitation',
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy
      handleCopyCode();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2 text-purple-600" />
            {mode === 'enter' ? 'Enter Promo Code' : 'Share & Earn'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {mode === 'enter' ? (
            <>
              <div className="text-center py-4">
                <Gift className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Got a promo code?</h3>
                <p className="text-gray-600 text-sm">
                  Enter your friend's code to get bonus points!
                </p>
              </div>

              <div className="space-y-3">
                <Input
                  placeholder="Enter promo code (e.g., RIDE-ABC123)"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                  className="text-center font-mono"
                />
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onClose} className="flex-1">
                    Skip
                  </Button>
                  <Button 
                    onClick={handleEnterCode}
                    disabled={!enteredCode.trim() || isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Applying...' : 'Apply Code'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <Share className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Your Promo Code</h3>
                <p className="text-gray-600 text-sm">
                  Share with friends and earn points for each referral!
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold font-mono text-purple-600 mb-2">
                  {userPromoCode}
                </div>
                <p className="text-sm text-gray-500">Your unique referral code</p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCopyCode}
                  className="flex-1"
                >
                  {hasCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {hasCopied ? 'Copied!' : 'Copy'}
                </Button>
                <Button onClick={handleShare} className="flex-1">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
