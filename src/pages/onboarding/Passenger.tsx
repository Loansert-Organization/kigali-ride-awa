
import React from 'react';
import { usePassengerOnboarding } from "@/hooks/usePassengerOnboarding";
import { translations } from "@/utils/onboardingTranslations";
import ProgressIndicator from "@/components/onboarding/passenger/ProgressIndicator";
import LocationStep from "@/components/onboarding/passenger/LocationStep";
import NotificationStep from "@/components/onboarding/passenger/NotificationStep";
import DestinationStep from "@/components/onboarding/passenger/DestinationStep";
import PromoStep from "@/components/onboarding/passenger/PromoStep";

const PassengerOnboarding = () => {
  const {
    currentStep,
    setCurrentStep,
    language,
    locationGranted,
    setLocationGranted,
    notificationsGranted,
    setNotificationsGranted,
    existingPromo,
    finishOnboarding
  } = usePassengerOnboarding();

  const t = translations[language];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <LocationStep
            onNext={() => setCurrentStep(1)}
            onLocationGranted={setLocationGranted}
            t={t}
          />
        );

      case 1:
        return (
          <NotificationStep
            onNext={() => setCurrentStep(2)}
            onNotificationsGranted={setNotificationsGranted}
            t={t}
          />
        );

      case 2:
        return (
          <DestinationStep
            onNext={() => setCurrentStep(3)}
            t={t}
          />
        );

      case 3:
        return (
          <PromoStep
            onFinish={finishOnboarding}
            existingPromo={existingPromo}
            t={t}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-orange-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="mb-6">
          <ProgressIndicator currentStep={currentStep} totalSteps={4} />
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {t.welcome}
          </h1>
        </div>

        {renderStep()}
      </div>
    </div>
  );
};

export default PassengerOnboarding;
