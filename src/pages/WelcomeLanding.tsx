
import { useState } from "react";
import WelcomeStep from "@/components/welcome/WelcomeStep";
import LanguageStep from "@/components/welcome/LanguageStep";
import RoleStep from "@/components/welcome/RoleStep";
import PermissionsStep from "@/components/welcome/PermissionsStep";
import { useNavigate } from "react-router-dom";

const WelcomeLanding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedRole, setSelectedRole] = useState<"passenger" | "driver" | null>(null);
  const navigate = useNavigate();

  const steps = [
    { component: WelcomeStep, title: "Welcome to Kigali Ride" },
    { component: LanguageStep, title: "Choose Language" },
    { component: RoleStep, title: "I want to..." },
    { component: PermissionsStep, title: "App Permissions" }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    handleNext();
  };

  const handleRoleSelect = (role: "passenger" | "driver") => {
    setSelectedRole(role);
    handleNext();
  };

  const handleComplete = () => {
    console.log('🎯 Welcome completed:', { selectedLanguage, selectedRole });
    
    // Store selections in localStorage for later use
    localStorage.setItem('preferred_language', selectedLanguage);
    if (selectedRole) {
      localStorage.setItem('preferred_role', selectedRole);
    }

    // Navigate to main app based on role preference
    if (selectedRole === 'passenger') {
      navigate('/home/passenger');
    } else if (selectedRole === 'driver') {
      navigate('/home/driver');
    } else {
      navigate('/home/passenger'); // Default to passenger view
    }
  };

  const handleSkipToApp = () => {
    // Allow users to skip directly to the app
    navigate('/home/passenger');
  };

  const handleGetStarted = () => {
    handleNext();
  };

  const handleRequestLocation = () => {
    handleComplete();
  };

  const handleSkipLocation = () => {
    handleComplete();
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Welcome to Kigali Ride!' },
    { code: 'kn', name: 'Kinyarwanda', flag: '🇷🇼', greeting: 'Murakaze kuri Kigali Ride!' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', greeting: 'Bienvenue sur Kigali Ride!' }
  ];

  const currentLang = languages.find(l => l.code === selectedLanguage) || languages[0];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onGetStarted={handleGetStarted} />;
      case 1:
        return (
          <LanguageStep
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={handleLanguageSelect}
          />
        );
      case 2:
        return (
          <RoleStep
            currentLang={currentLang}
            onRoleSelect={handleRoleSelect}
            isProcessing={false}
            selectedRole={selectedRole}
            urlPromo={null}
            showPromoInput={false}
            setShowPromoInput={() => {}}
            promoCode=""
            setPromoCode={() => {}}
          />
        );
      case 3:
        return (
          <PermissionsStep
            selectedRole={selectedRole}
            onRequestLocation={handleRequestLocation}
            onSkipLocation={handleSkipLocation}
            showPWAPrompt={false}
            setShowPWAPrompt={() => {}}
          />
        );
      default:
        return <WelcomeStep onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {renderCurrentStep()}
    </div>
  );
};

export default WelcomeLanding;
