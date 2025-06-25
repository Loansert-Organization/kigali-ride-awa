
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Gift } from 'lucide-react';

interface ConfettiSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  showConfetti?: boolean;
}

export const ConfettiSuccessModal: React.FC<ConfettiSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actionLabel = "Continue",
  onAction,
  showConfetti = true
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isOpen && showConfetti) {
      setShowAnimation(true);
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      
      // Auto-close after animation
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, showConfetti]);

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <div className="py-6">
          {/* Confetti Animation */}
          {showAnimation && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                >
                  {i % 3 === 0 ? '🎉' : i % 3 === 1 ? '⭐' : '🎊'}
                </div>
              ))}
            </div>
          )}

          {/* Success Icon */}
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleAction}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Star className="w-4 h-4 mr-2" />
                {actionLabel}
              </Button>
              
              <Button 
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
