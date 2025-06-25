
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Copy, Share2, Trophy } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ReferralBannerBlockProps {
  promoCode: string;
  onViewRewards: () => void;
}

const ReferralBannerBlock: React.FC<ReferralBannerBlockProps> = ({
  promoCode,
  onViewRewards
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
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

  const handleShare = () => {
    const message = `Join Kigali Ride and use my code ${promoCode} for your first trip!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="mb-4 bg-gradient-to-r from-purple-50 to-orange-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 flex items-center">
              <Gift className="w-5 h-5 mr-2 text-purple-600" />
              🎁 Referral & Rewards
            </h3>
            <div className="bg-white rounded-lg px-3 py-2 border-2 border-dashed border-purple-300">
              <p className="text-sm text-gray-600 mb-1">Your referral code:</p>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-lg font-bold text-purple-600">{promoCode}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-8 px-3"
                >
                  {copied ? '✓' : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="bg-green-500 text-white hover:bg-green-600 border-green-500"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onViewRewards}
              className="text-purple-600 border-purple-300 hover:bg-purple-50"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Rewards
            </Button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mt-3">
          Share your code and earn points when friends complete their first ride!
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralBannerBlock;
