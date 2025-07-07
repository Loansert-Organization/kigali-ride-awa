import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalization, Language } from '@/hooks/useLocalization';
import { Globe } from 'lucide-react';

export const LanguageSelector = ({ variant = 'select' }: { variant?: 'select' | 'buttons' }) => {
  const { language, changeLanguage, availableLanguages } = useLocalization();

  if (variant === 'buttons') {
    return (
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-1">
          {availableLanguages.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeLanguage(lang.code as Language)}
              className="text-xs px-2 py-1 h-7"
            >
              {lang.code.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={language} onValueChange={(value) => changeLanguage(value as Language)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};