
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UnifiedWhatsAppOTP } from './UnifiedWhatsAppOTP';

interface WhatsAppOTPFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phoneNumber: string) => void;
  userProfile?: any;
}

export const WhatsAppOTPFlow: React.FC<WhatsAppOTPFlowProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userProfile
}) => {
  const handleSuccess = () => {
    const storedPhone = localStorage.getItem('whatsapp_phone');
    if (storedPhone) {
      onSuccess(storedPhone);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>WhatsApp Verification</DialogTitle>
      </DialogHeader>
      <DialogContent className="max-w-md">
        <UnifiedWhatsAppOTP
          onSuccess={handleSuccess}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
