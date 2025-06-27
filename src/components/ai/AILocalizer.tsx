
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Globe, Copy, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logError } from "@/utils/errorHandlers";

interface Translations {
  en: string;
  kn: string;
  fr: string;
  [key: string]: string;
}

interface AILocalizerProps {
  text?: string;
  onTranslated?: (translations: Translations) => void;
}

const AILocalizer: React.FC<AILocalizerProps> = ({ text: initialText, onTranslated }) => {
  const [text, setText] = useState(initialText || '');
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) {
      toast({
        title: "Enter text",
        description: "Please enter text to translate",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-localize', {
        body: {
          text,
          targetLanguages: ['en', 'kn', 'fr'],
          context: 'Kigali Ride mobile app UI',
          tone: 'friendly and professional'
        }
      });

      if (error) throw error;

      setTranslations(data.translations);
      onTranslated?.(data.translations);
      
      toast({
        title: "Translation Complete",
        description: "Text translated to all languages",
      });
    } catch (err) {
      logError('Translation Error:', err);
      toast({
        title: "Translation Failed",
        description: "Unable to translate text",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyTranslation = async (lang: string, translation: string) => {
    try {
      await navigator.clipboard.writeText(translation);
      setCopied(lang);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Copied",
        description: `${lang.toUpperCase()} translation copied`,
      });
    } catch (_error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy translation",
        variant: "destructive"
      });
    }
  };

  const languageLabels = {
    en: 'English',
    kn: 'Kinyarwanda',
    fr: 'Français'
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-green-600" />
          AI Localizer
          <Badge variant="secondary">3 Languages</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Text to Translate</label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to translate..."
          />
        </div>

        <Button 
          onClick={handleTranslate} 
          disabled={loading || !text.trim()}
          className="w-full"
        >
          <Globe className="w-4 h-4 mr-2" />
          {loading ? 'Translating...' : 'Translate'}
        </Button>

        {translations && (
          <div className="space-y-3">
            <h4 className="font-medium">Translations</h4>
            {Object.entries(translations).map(([lang, translation]) => (
              <Card key={lang} className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline">{languageLabels[lang as keyof typeof languageLabels]}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyTranslation(lang, translation as string)}
                    >
                      {copied === lang ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm">{translation as string}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AILocalizer;
