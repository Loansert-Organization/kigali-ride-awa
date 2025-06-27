
import React from 'react';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  totalSteps,
  steps
}) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center">
        {steps.map((stepLabel, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                {stepLabel}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div className="flex-1 h-1 mx-4 bg-gray-300 rounded">
                <div
                  className={`h-full rounded transition-all duration-300 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                  style={{
                    width: index < currentStep ? '100%' : '0%'
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
