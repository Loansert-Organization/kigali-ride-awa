
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Check } from 'lucide-react';

interface Step {
  label: string;
  completed: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((stepItem, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                stepItem.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : index === currentStep
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}
            >
              {stepItem.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className="text-xs mt-1 text-center max-w-16">
              {stepItem.label}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 mx-2 ${
                stepItem.completed ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
