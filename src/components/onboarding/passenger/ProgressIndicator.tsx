
import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps
}) => {
  return (
    <div className="flex justify-center space-x-2 mb-4">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={`w-3 h-3 rounded-full transition-colors ${
            currentStep >= index ? 'bg-white' : 'bg-white/30'
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressIndicator;
