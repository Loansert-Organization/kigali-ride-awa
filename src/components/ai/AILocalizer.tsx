
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Loader2, CheckCircle } from 'lucide-react';

interface Translation {
  id: string;
  key: string;
  originalText: string;
  translatedText: string;
  language: string;
  status: 'pending' | 'completed';
}

const AILocalizer: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const languages = [
    { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  ];

  const sampleTexts = [
    { key: 'welcome_message', text: 'Welcome to Kigali Ride' },
    { key: 'book_ride', text: 'Book a Ride' },
    { key: 'driver_mode', text: 'Switch to Driver Mode' },
    { key: 'find_passengers', text: 'Find Passengers' },
  ];

  const handleGenerateTranslations = async () => {
    if (!selectedLanguage) return;

    setIsProcessing(true);
    
    // Simulate AI translation
    setTimeout(() => {
      const newTranslations = sampleTexts.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        key: item.key,
        originalText: item.text,
        translatedText: getSimulatedTranslation(item.text, selectedLanguage),
        language: selectedLanguage,
        status: 'completed' as const
      }));
      
      setTranslations(prev => [...newTranslations, ...prev]);
      setIsProcessing(false);
    }, 3000);
  };

  const getSimulatedTranslation = (text: string, language: string): string => {
    // Simple simulation - in real implementation, this would call AI service
    const translations: Record<string, Record<string, string>> = {
      'rw': {
        'Welcome to Kigali Ride': 'Murakaza neza kuri Kigali Ride',
        'Book a Ride': 'Andika Urugendo',
        'Switch to Driver Mode': 'Hinduka mu buryo bw\'umushoferi',
        'Find Passengers': 'Shakisha Abagenzi'
      },
      'fr': {
        'Welcome to Kigali Ride': 'Bienvenue sur Kigali Ride',
        'Book a Ride': 'Réserver un Trajet',
        'Switch to Driver Mode': 'Passer en Mode Conducteur',
        'Find Passengers': 'Trouver des Passagers'
      }
    };
    
    return translations[language]?.[text] || `[${language.toUpperCase()}] ${text}`;
  };

  const getLanguageName = (code: string) => {
    return languages.find(lang => lang.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return languages.find(lang => lang.code === code)?.flag || '🌍';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            AI Localizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleGenerateTranslations}
              disabled={!selectedLanguage || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                'Generate Translations'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {translations.map((translation) => (
          <Card key={translation.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{translation.key}</Badge>
                  <div className="flex items-center space-x-1">
                    <span>{getLanguageFlag(translation.language)}</span>
                    <span className="text-sm text-gray-600">
                      {getLanguageName(translation.language)}
                    </span>
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">
                    Original (English)
                  </label>
                  <p className="text-sm">{translation.originalText}</p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wide">
                    Translation
                  </label>
                  <p className="text-sm font-medium">{translation.translatedText}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isProcessing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Generating translations...</p>
            <p className="text-sm text-gray-500 mt-1">
              This may take a few moments
            </p>
          </CardContent>
        </Card>
      )}

      {translations.length === 0 && !isProcessing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No translations yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Select a language and generate translations to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AILocalizer;
