
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from 'lucide-react';

interface ConfettiSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

const ConfettiSuccessModal: React.FC<ConfettiSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actionText = "Continue",
  onAction
}) => {
  useEffect(() => {
    if (isOpen) {
      // Auto-close after 3 seconds if no action is provided
      if (!onAction) {
        const timer = setTimeout(() => {
          onClose();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, onAction, onClose]);

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-green-600" />
              <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-green-800">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          
          <Button onClick={handleAction} className="w-full">
            {actionText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfettiSuccessModal;
