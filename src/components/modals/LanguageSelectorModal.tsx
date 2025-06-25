
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Globe } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'rw', name: 'Kinyarwanda', flag: '🇷🇼' }
];

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLanguage
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLanguageUpdate = async () => {
    if (selectedLanguage === currentLanguage) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      const { error } = await supabase
        .from('users')
        .update({ language: selectedLanguage })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        language: selectedLanguage
      }));

      toast({
        title: "Language updated",
        description: `Language changed to ${languages.find(l => l.code === selectedLanguage)?.name}`,
      });

      onClose();
    } catch (error) {
      console.error('Error updating language:', error);
      toast({
        title: "Error",
        description: "Failed to update language",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Choose Language
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={selectedLanguage === language.code ? "default" : "outline"}
              className="w-full justify-between"
              onClick={() => setSelectedLanguage(language.code)}
            >
              <div className="flex items-center">
                <span className="text-xl mr-3">{language.flag}</span>
                <span>{language.name}</span>
              </div>
              {selectedLanguage === language.code && (
                <Check className="w-4 h-4" />
              )}
            </Button>
          ))}
        </div>

        <div className="flex space-x-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleLanguageUpdate}
            disabled={isUpdating}
            className="flex-1"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
