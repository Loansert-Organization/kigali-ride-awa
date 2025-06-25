
import React from 'react';

interface CreateTripProgressIndicatorProps {
  currentStep: number;
}

const CreateTripProgressIndicator: React.FC<CreateTripProgressIndicatorProps> = ({
  currentStep
}) => {
  const steps = [
    { number: 1, label: 'Route & Time' },
    { number: 2, label: 'Details & Fare' },
    { number: 3, label: 'Confirm' }
  ];

  return (
    <div className="bg-white px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep >= step.number 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 text-gray-600'
              }
            `}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span className={`
              ml-2 text-sm font-medium
              ${currentStep >= step.number ? 'text-purple-600' : 'text-gray-500'}
            `}>
              {step.label}
            </span>
            
            {index < steps.length - 1 && (
              <div className={`
                mx-4 h-0.5 w-8 
                ${currentStep > step.number ? 'bg-purple-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateTripProgressIndicator;
