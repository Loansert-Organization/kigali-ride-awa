
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export const useLanguageSelection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'kn' | 'fr'>('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Welcome to Kigali Ride!' },
    { code: 'kn', name: 'Kinyarwanda', flag: '🇷🇼', greeting: 'Murakaze kuri Kigali Ride!' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', greeting: 'Bienvenue sur Kigali Ride!' }
  ];

  const currentLang = languages.find(l => l.code === selectedLanguage) || languages[0];

  // Auto-detect language from browser
  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setSelectedLanguage(savedLang as 'en' | 'kn' | 'fr');
    } else {
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.includes('fr')) setSelectedLanguage('fr');
      else if (browserLang.includes('rw')) setSelectedLanguage('kn');
    }
  }, []);

  const handleLanguageSelect = (lang: 'en' | 'kn' | 'fr') => {
    setSelectedLanguage(lang);
    localStorage.setItem('language', lang);
    
    toast({
      title: "Language updated",
      description: `${languages.find(l => l.code === lang)?.name} selected`,
    });
  };

  return {
    selectedLanguage,
    languages,
    currentLang,
    handleLanguageSelect
  };
};
