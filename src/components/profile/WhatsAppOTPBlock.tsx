
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { WhatsAppOTPFlow } from "@/components/auth/WhatsAppOTPFlow";
import { useAuth } from "@/contexts/AuthContext";

const WhatsAppOTPBlock: React.FC = () => {
  const [showOTPFlow, setShowOTPFlow] = useState(false);
  const { userProfile, refreshUserProfile } = useAuth();

  const handleOTPSuccess = async (phoneNumber: string) => {
    setShowOTPFlow(false);
    await refreshUserProfile();
  };

  const isVerified = userProfile?.phone_verified && userProfile?.auth_method === 'whatsapp';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp OTP Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">WhatsApp Verified</span>
              </div>
              <p className="text-sm text-green-800 mb-2">
                📱 Phone: {userProfile.phone_number}
              </p>
              <div className="flex items-center space-x-2 text-xs text-green-700">
                <Zap className="w-3 h-3" />
                <span>Template ikanisa • Phone ID 396791596844039 • Secure OTP</span>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">WhatsApp OTP Available</span>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Verify your phone number using our secure WhatsApp OTP system with the ikanisa template
              </p>
              <Button 
                onClick={() => setShowOTPFlow(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Shield className="w-4 h-4 mr-2" />
                Verify with WhatsApp OTP
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <WhatsAppOTPFlow
        isOpen={showOTPFlow}
        onClose={() => setShowOTPFlow(false)}
        onSuccess={handleOTPSuccess}
        userProfile={userProfile}
      />
    </>
  );
};

export default WhatsAppOTPBlock;
