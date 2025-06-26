
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { Language, LanguageCode } from '@/constants/languages';

interface LanguageStepProps {
  languages: readonly Language[];
  selectedLanguage: LanguageCode;
  onLanguageSelect: (lang: LanguageCode) => void;
}

const LanguageStep: React.FC<LanguageStepProps> = ({ 
  languages, 
  selectedLanguage, 
  onLanguageSelect 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <Globe className="w-16 h-16 mx-auto text-blue-500 mb-4" />
            <h2 className="text-heading-2 text-gray-900 mb-2">Choose Your Language</h2>
            <p className="text-body text-gray-600">Select your preferred language</p>
          </div>

          <div className="space-y-3">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                className="w-full justify-start text-left hover-scale font-semibold"
                onClick={() => onLanguageSelect(lang.code)}
              >
                <span className="text-2xl mr-3">{lang.flag}</span>
                <span className="text-[18px]">{lang.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageStep;
