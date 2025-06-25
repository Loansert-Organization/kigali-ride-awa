
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { WhatsAppAuthModal } from "@/components/modals/WhatsAppAuthModal";
import { useWhatsAppAuth } from "@/hooks/useWhatsAppAuth";

const WhatsAppStatusBlock: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isWhatsAppVerified, phoneNumber, upgradeAnonymousToWhatsApp } = useWhatsAppAuth();

  const handleWhatsAppAuth = async (phone: string) => {
    const result = await upgradeAnonymousToWhatsApp(phone);
    if (result.success) {
      setShowAuthModal(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isWhatsAppVerified ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">WhatsApp Connected</span>
              </div>
              <p className="text-sm text-green-800 mb-2">
                Phone: {phoneNumber}
              </p>
              <p className="text-xs text-green-700">
                ✅ Chat enabled • ✅ Account synced • ✅ Rewards active
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-900">WhatsApp Not Connected</span>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                Connect WhatsApp to enable chat with drivers and sync your account
              </p>
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Connect WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <WhatsAppAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleWhatsAppAuth}
        title="Connect WhatsApp"
        description="Link your WhatsApp to enable chat with drivers and sync your account across devices"
      />
    </>
  );
};

export default WhatsAppStatusBlock;
