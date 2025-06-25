
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LanguageSelectorBlockProps {
  currentLanguage: string;
}

const LanguageSelectorBlock: React.FC<LanguageSelectorBlockProps> = ({
  currentLanguage
}) => {
  const languages = [
    { value: 'en', label: '🇺🇸 English', name: 'English' },
    { value: 'kn', label: '🇷🇼 Kinyarwanda', name: 'Kinyarwanda' },
    { value: 'fr', label: '🇫🇷 Français', name: 'French' }
  ];

  const handleLanguageChange = (newLanguage: string) => {
    // Store in localStorage
    localStorage.setItem('language', newLanguage);
    
    // Show success message
    const selectedLang = languages.find(lang => lang.value === newLanguage);
    toast({
      title: "Language updated",
      description: `App language changed to ${selectedLang?.name}`,
    });

    // In a real app, this would trigger app-wide language change
    // For now, we'll just reload the page to apply the change
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const currentLangLabel = languages.find(lang => lang.value === currentLanguage)?.label || languages[0].label;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Globe className="w-5 h-5 mr-2" />
          🌍 Language
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={currentLangLabel} />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectorBlock;
