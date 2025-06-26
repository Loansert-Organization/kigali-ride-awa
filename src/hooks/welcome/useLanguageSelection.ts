
import { useState, useEffect } from 'react';
import { LANGUAGES, LanguageCode } from '@/constants/languages';
import { toast } from '@/hooks/use-toast';

export const useLanguageSelection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');

  // Auto-detect language from browser
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setSelectedLanguage(savedLang as LanguageCode);
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('fr')) setSelectedLanguage('fr');
      else if (browserLang.includes('rw')) setSelectedLanguage('kn');
    }
  }, []);

  const handleLanguageSelect = (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    localStorage.setItem('language', lang);
    
    toast({
      title: "Language updated",
      description: `${LANGUAGES.find(l => l.code === lang)?.name} selected`,
    });
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage) || LANGUAGES[0];

  return {
    selectedLanguage,
    currentLang,
    languages: LANGUAGES,
    handleLanguageSelect
  };
};
