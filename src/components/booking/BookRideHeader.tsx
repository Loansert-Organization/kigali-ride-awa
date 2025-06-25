
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface BookRideHeaderProps {
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

const BookRideHeader: React.FC<BookRideHeaderProps> = ({
  onBack,
  currentStep,
  totalSteps
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Book a Ride</h1>
          <p className="text-sm text-gray-500">Step {currentStep + 1} of {totalSteps}</p>
        </div>
      </div>
    </div>
  );
};

export default BookRideHeader;
