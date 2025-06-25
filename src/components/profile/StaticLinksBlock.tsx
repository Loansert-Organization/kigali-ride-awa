
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info, Shield, HelpCircle } from 'lucide-react';

const StaticLinksBlock: React.FC = () => {
  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ℹ️ Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={() => handleLinkClick('https://kigaliride.com/about')}
        >
          <Info className="w-4 h-4 mr-3 text-gray-500" />
          <div className="text-left">
            <p className="font-medium">ℹ️ About Kigali Ride</p>
            <p className="text-sm text-gray-600">Learn about our mission</p>
          </div>
          <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={() => handleLinkClick('https://kigaliride.com/privacy')}
        >
          <Shield className="w-4 h-4 mr-3 text-gray-500" />
          <div className="text-left">
            <p className="font-medium">🔐 Privacy & Terms</p>
            <p className="text-sm text-gray-600">How we protect your data</p>
          </div>
          <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-3"
          onClick={() => handleLinkClick('https://wa.me/250788123456')}
        >
          <HelpCircle className="w-4 h-4 mr-3 text-gray-500" />
          <div className="text-left">
            <p className="font-medium">❓ Help / Contact</p>
            <p className="text-sm text-gray-600">Get support via WhatsApp</p>
          </div>
          <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />
        </Button>

        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Kigali Ride v1.0 • Made with ❤️ in Rwanda
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticLinksBlock;
