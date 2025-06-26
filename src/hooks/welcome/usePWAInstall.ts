
import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);

  // PWA Install Prompt Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setTimeout(() => setShowPWAPrompt(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  return {
    showPWAPrompt,
    setShowPWAPrompt
  };
};
