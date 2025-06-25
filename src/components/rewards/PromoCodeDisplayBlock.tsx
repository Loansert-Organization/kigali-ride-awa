
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Gift } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface PromoCodeDisplayBlockProps {
  promoCode: string;
}

const PromoCodeDisplayBlock: React.FC<PromoCodeDisplayBlockProps> = ({
  promoCode
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

  const handleShareWhatsApp = () => {
    const shareUrl = `${window.location.origin}?promo=${promoCode}`;
    const message = `🚗 Hey! Try Kigali Ride and use my code ${promoCode} for your first trip! ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="bg-gradient-to-r from-purple-500 to-orange-500 text-white">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Gift className="w-6 h-6 mr-2" />
          🎁 Your Referral Code
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <span className="font-mono text-3xl font-bold tracking-wider">
              {promoCode}
            </span>
          </div>
          <p className="text-white/90 text-sm mb-4">
            Share this code and earn points when friends complete rides!
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleCopyCode}
            variant="secondary"
            className="flex-1 bg-white/20 text-white hover:bg-white/30 border-white/30"
          >
            {copied ? '✓ Copied' : <><Copy className="w-4 h-4 mr-2" />📋 Copy</>}
          </Button>
          <Button
            onClick={handleShareWhatsApp}
            variant="secondary"
            className="flex-1 bg-green-500 text-white hover:bg-green-600 border-green-500"
          >
            <Share2 className="w-4 h-4 mr-2" />
            🔗 Share via WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoCodeDisplayBlock;
