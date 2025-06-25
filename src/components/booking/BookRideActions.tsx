
import React from 'react';
import { Button } from "@/components/ui/button";

interface BookRideActionsProps {
  onNext: () => void;
  canProceed: boolean;
  isLastStep: boolean;
}

const BookRideActions: React.FC<BookRideActionsProps> = ({
  onNext,
  canProceed,
  isLastStep
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <Button
        onClick={onNext}
        disabled={!canProceed}
        className="w-full h-12 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-semibold"
      >
        {isLastStep ? '🚖 Book Ride' : 'Next →'}
      </Button>
    </div>
  );
};

export default BookRideActions;
