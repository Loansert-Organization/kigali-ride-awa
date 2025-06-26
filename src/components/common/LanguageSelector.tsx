
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';

const languages = [
  { code: 'kn', name: 'Kinyarwanda', flag: '🇷🇼', greeting: 'Murakaze kuri Kigali Ride!' },
  { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Welcome to Kigali Ride!' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', greeting: 'Bienvenue sur Kigali Ride!' }
];

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelect: (language: string) => void;
  selectedLanguage: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isOpen,
  onClose,
  onLanguageSelect,
  selectedLanguage
}) => {
  const handleLanguageSelect = (langCode: string) => {
    onLanguageSelect(langCode);
    localStorage.setItem('preferred_language', langCode);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-purple-600" />
            Choose Language / Hitamo Ururimi
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              variant={selectedLanguage === lang.code ? "default" : "outline"}
              className="w-full justify-start h-auto p-4"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-sm text-gray-600">{lang.greeting}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
