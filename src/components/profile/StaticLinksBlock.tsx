
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Shield, FileText, HelpCircle, Bug } from 'lucide-react';

const StaticLinksBlock = () => {
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const links = [
    {
      icon: <Shield className="w-4 h-4" />,
      label: 'Privacy Policy',
      url: '#',
      description: 'How we protect your data'
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: 'Terms of Service',
      url: '#',
      description: 'Platform usage guidelines'
    },
    {
      icon: <HelpCircle className="w-4 h-4" />,
      label: 'Help & Support',
      url: '#',
      description: 'Get help and contact us'
    },
    {
      icon: <Bug className="w-4 h-4" />,
      label: 'Report an Issue',
      url: '#',
      description: 'Report bugs or problems'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ExternalLink className="w-5 h-5 mr-2" />
          📄 Legal & Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {links.map((link, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start h-auto p-3 border border-gray-200 hover:bg-gray-50"
              onClick={() => openLink(link.url)}
            >
              <div className="flex items-center space-x-3 w-full">
                {link.icon}
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.description}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Kigali Ride v1.0.0 • Made with ❤️ in Rwanda
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticLinksBlock;
