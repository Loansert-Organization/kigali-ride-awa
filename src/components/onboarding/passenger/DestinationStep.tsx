import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, Church, ShoppingBag, Edit3 } from 'lucide-react';

interface DestinationStepProps {
  onNext: () => void;
  onBack: () => void;
  onDestinationSaved: (destination: string) => void;
  t: (key: string) => string;
}

const DestinationStep: React.FC<DestinationStepProps> = ({
  onNext,
  onBack,
  onDestinationSaved,
  t
}) => {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [customAddress, setCustomAddress] = useState('');

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    if (destination !== 'other') {
      localStorage.setItem('smart_suggestion', destination);
      setTimeout(() => onNext(), 500);
    }
  };

  const handleCustomAddress = () => {
    if (customAddress.trim()) {
      localStorage.setItem('smart_suggestion', customAddress);
      setTimeout(() => onNext(), 500);
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm animate-fade-in">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">{t('whereHeaded')}</h2>
          <p className="text-gray-600 mt-2">Help us suggest better routes</p>
        </div>
        
        <div className="space-y-3">
          <Button 
            variant={selectedDestination === 'home' ? "default" : "outline"}
            onClick={() => handleDestinationSelect('home')} 
            className="w-full justify-start py-3"
          >
            <Home className="w-5 h-5 mr-3" />
            {t('home')}
          </Button>
          
          <Button 
            variant={selectedDestination === 'church' ? "default" : "outline"}
            onClick={() => handleDestinationSelect('church')} 
            className="w-full justify-start py-3"
          >
            <Church className="w-5 h-5 mr-3" />
            {t('church')}
          </Button>
          
          <Button 
            variant={selectedDestination === 'market' ? "default" : "outline"}
            onClick={() => handleDestinationSelect('market')} 
            className="w-full justify-start py-3"
          >
            <ShoppingBag className="w-5 h-5 mr-3" />
            {t('market')}
          </Button>
          
          <Button 
            variant={selectedDestination === 'other' ? "default" : "outline"}
            onClick={() => handleDestinationSelect('other')} 
            className="w-full justify-start py-3"
          >
            <Edit3 className="w-5 h-5 mr-3" />
            {t('other')}
          </Button>

          {selectedDestination === 'other' && (
            <div className="space-y-2 animate-fade-in">
              <Input
                type="text"
                placeholder={t('enterAddress')}
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={handleCustomAddress}
                disabled={!customAddress.trim()}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          )}

          <Button 
            variant="ghost" 
            onClick={onNext} 
            className="w-full mt-4"
          >
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DestinationStep;
