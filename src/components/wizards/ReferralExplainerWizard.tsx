
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Gift, Users, Star, Trophy, Copy } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ReferralExplainerWizardProps {
  isOpen: boolean;
  onClose: () => void;
  userPromoCode?: string;
}

const steps = [
  {
    title: "Welcome to Referral Rewards! 🎉",
    icon: <Gift className="w-12 h-12 text-purple-600" />,
    content: "Earn points by inviting friends to join Kigali Ride. The more friends you refer, the more rewards you earn!",
    color: "bg-purple-100"
  },
  {
    title: "How It Works 🚀",
    icon: <Users className="w-12 h-12 text-blue-600" />,
    content: "Share your unique promo code with friends. When they sign up and complete their first ride, you both get rewarded!",
    color: "bg-blue-100"
  },
  {
    title: "Point System ⭐",
    icon: <Star className="w-12 h-12 text-yellow-600" />,
    content: "Earn 1 point for each passenger referral and 5 points for each driver referral who completes 5 rides.",
    color: "bg-yellow-100"
  },
  {
    title: "Leaderboard & Prizes 🏆",
    icon: <Trophy className="w-12 h-12 text-green-600" />,
    content: "Compete on our weekly leaderboard! Top 5 referrers win special prizes and recognition.",
    color: "bg-green-100"
  }
];

export const ReferralExplainerWizard: React.FC<ReferralExplainerWizardProps> = ({
  isOpen,
  onClose,
  userPromoCode
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCopyPromoCode = () => {
    if (userPromoCode) {
      navigator.clipboard.writeText(userPromoCode);
      toast({
        title: "Promo Code Copied!",
        description: "Share it with your friends to start earning rewards"
      });
    }
  };

  const handleFinish = () => {
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="space-y-6">
          {/* Progress indicators */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${currentStepData.color}`}>
                {currentStepData.icon}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {currentStepData.title}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {currentStepData.content}
              </p>

              {/* Show promo code on last step */}
              {currentStep === steps.length - 1 && userPromoCode && (
                <div className="bg-purple-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-purple-800 mb-2">Your Promo Code:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <code className="bg-white px-3 py-2 rounded font-mono text-lg font-bold text-purple-900">
                      {userPromoCode}
                    </code>
                    <Button
                      size="sm"
                      onClick={handleCopyPromoCode}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex items-center bg-purple-600 hover:bg-purple-700"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Referring! 🎉
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
