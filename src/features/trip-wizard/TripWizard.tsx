import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RouteStep } from './RouteStep';
import { DetailsStep } from './DetailsStep';
import { ReviewStep } from './ReviewStep';
import { SuccessSheet } from './SuccessSheet';
import { useTripDraft } from './hooks/useTripDraft';
import { Car, UserCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MapLocation } from '@/types';

export type TripRole = 'driver' | 'passenger';

export interface TripDraft {
  role: TripRole;
  origin?: MapLocation;
  destination?: MapLocation;
  seats: number;
  vehicleType?: string;
  departureTime?: Date;
  notes?: string;
  estimatedPrice?: number;
}

interface TripWizardProps {
  onClose?: () => void;
}

export const TripWizard = ({ onClose }: TripWizardProps) => {
  const { toast } = useToast();
  const { draft, updateDraft, clearDraft } = useTripDraft();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);

  // Check for AI draft trip on mount
  useEffect(() => {
    const aiDraft = localStorage.getItem('ai_draft_trip');
    if (aiDraft) {
      try {
        const draftData = JSON.parse(aiDraft);
        updateDraft({
          role: draftData.role,
          origin: draftData.origin,
          destination: draftData.destination,
          departureTime: draftData.departureTime ? new Date(draftData.departureTime) : undefined,
          seats: draftData.seats || 1,
          vehicleType: draftData.vehicleType
        });
        
        // Clear the draft from localStorage
        localStorage.removeItem('ai_draft_trip');
        
        // Show toast
        toast({
          title: "AI Draft Loaded",
          description: "Your trip details have been pre-filled",
        });
      } catch (error) {
        console.error('Error loading AI draft:', error);
      }
    }
  }, []);

  // Role switching
  const toggleRole = () => {
    updateDraft({ 
      role: draft.role === 'driver' ? 'passenger' : 'driver',
      // Reset role-specific fields
      seats: draft.role === 'driver' ? 1 : 2,
      vehicleType: undefined
    });
  };

  const canProceedToStep2 = () => {
    return draft.origin && draft.destination;
  };

  const canProceedToStep3 = () => {
    return canProceedToStep2() && 
           draft.seats > 0 && 
           draft.departureTime &&
           (draft.role === 'passenger' || draft.vehicleType);
  };

  const canSubmit = () => {
    return canProceedToStep3();
  };

  const handleNext = () => {
    if (currentStep === 1 && !canProceedToStep2()) {
      toast({
        title: "Complete Route",
        description: "Please select both pickup and destination locations",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 2 && !canProceedToStep3()) {
      toast({
        title: "Complete Details",
        description: "Please fill in all required trip details",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
    
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const progressPercentage = (currentStep / 3) * 100;

  // Auto-focus destination after origin is picked
  useEffect(() => {
    if (currentStep === 1 && draft.origin && !draft.destination) {
      // Small delay to ensure UI updates
      setTimeout(() => {
        const destinationInput = document.querySelector('[data-destination-input]');
        if (destinationInput instanceof HTMLInputElement) {
          destinationInput.focus();
        }
      }, 100);
    }
  }, [draft.origin, currentStep]);

  if (isSuccess) {
    return (
      <SuccessSheet 
        tripId={tripId!}
        role={draft.role}
        onClose={() => {
          setIsSuccess(false);
          clearDraft();
          onClose?.();
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Create Trip</CardTitle>
            {onClose && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-500"
              >
                ✕
              </Button>
            )}
          </div>
          
          {/* Role Switcher */}
          <div className="flex items-center justify-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <UserCheck className={`w-5 h-5 ${draft.role === 'passenger' ? 'text-blue-600' : 'text-gray-400'}`} />
              <Label htmlFor="role-switch" className="text-sm">
                I need a ride
              </Label>
            </div>
            
            <Switch
              id="role-switch"
              checked={draft.role === 'driver'}
              onCheckedChange={toggleRole}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#3D7DFF] data-[state=checked]:to-[#8E42FF]"
            />
            
            <div className="flex items-center space-x-2">
              <Car className={`w-5 h-5 ${draft.role === 'driver' ? 'text-purple-600' : 'text-gray-400'}`} />
              <Label htmlFor="role-switch" className="text-sm">
                I'm driving
              </Label>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
                1. Route
              </span>
              <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
                2. Details
              </span>
              <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>
                3. Review
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-gradient-to-r from-[#3D7DFF] to-[#8E42FF]"
            />
          </div>
        </CardHeader>

        <CardContent>
          {/* Step Content */}
          {currentStep === 1 && (
            <RouteStep 
              draft={draft}
              onUpdate={updateDraft}
            />
          )}
          
          {currentStep === 2 && (
            <DetailsStep 
              draft={draft}
              onUpdate={updateDraft}
            />
          )}
          
          {currentStep === 3 && (
            <ReviewStep 
              draft={draft}
              onUpdate={updateDraft}
              onSubmit={(tripId) => {
                setTripId(tripId);
                setIsSuccess(true);
              }}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          )}
        </CardContent>

        {/* Navigation Footer */}
        <div className="px-6 pb-6">
          <div className="flex justify-between gap-3">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !canProceedToStep2()) ||
                  (currentStep === 2 && !canProceedToStep3())
                }
                className="flex-1 bg-gradient-to-r from-[#3D7DFF] to-[#8E42FF] hover:from-[#2D6DFF] hover:to-[#7E32FF]"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => {}} // Handled in ReviewStep
                disabled={!canSubmit() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#15803d] hover:to-[#14532d]"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Trip'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}; 