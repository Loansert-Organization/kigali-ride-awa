
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface LanguageSelectorProps {
  selectedLanguage: 'en' | 'kn' | 'fr';
  onLanguageChange: (lang: 'en' | 'kn' | 'fr') => void;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
  t: any;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  showLanguageSelector,
  setShowLanguageSelector,
  t
}) => {
  const handleLanguageChange = (lang: 'en' | 'kn' | 'fr') => {
    onLanguageChange(lang);
    localStorage.setItem('language', lang);
    setShowLanguageSelector(false);
    toast({
      title: "Language Updated",
      description: `Language changed to ${lang === 'en' ? 'English' : lang === 'kn' ? 'Kinyarwanda' : 'Français'}`,
    });
  };

  return (
    <>
      {/* Language selector button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowLanguageSelector(true)}
        className="mt-4 bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
      >
        <Globe className="w-4 h-4 mr-2" />
        {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'kn' ? 'Kinyarwanda' : 'Français'}
      </Button>

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm animate-scale-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t.languageSelect}</h3>
              <div className="space-y-2">
                {[
                  { code: 'en', name: 'English', flag: '🇺🇸' },
                  { code: 'kn', name: 'Kinyarwanda', flag: '🇷🇼' },
                  { code: 'fr', name: 'Français', flag: '🇫🇷' }
                ].map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleLanguageChange(lang.code as 'en' | 'kn' | 'fr')}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {selectedLanguage === lang.code && <Check className="w-4 h-4 mr-2" />}
                    {lang.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;
