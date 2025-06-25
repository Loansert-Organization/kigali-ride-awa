
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface PWAInstallPromptProps {
  showPWAPrompt: boolean;
  setShowPWAPrompt: (show: boolean) => void;
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
  t: any;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  showPWAPrompt,
  setShowPWAPrompt,
  deferredPrompt,
  setDeferredPrompt,
  t
}) => {
  const handlePWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast({
          title: "App Installed!",
          description: "Kigali Ride has been added to your home screen",
        });
      }
      setDeferredPrompt(null);
      setShowPWAPrompt(false);
    }
  };

  if (!showPWAPrompt) return null;

  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center mb-2">
        <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="font-medium text-blue-900">{t.installApp}</h3>
      </div>
      <p className="text-sm text-blue-700 mb-3">{t.installDesc}</p>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handlePWAInstall}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Install
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPWAPrompt(false)}
        >
          Later
        </Button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
