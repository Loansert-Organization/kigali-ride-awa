import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, X } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';

export const EmergencyNav: React.FC = () => {
  const [showEmergencyNav, setShowEmergencyNav] = useState(false);
  const { goToHome, goBack, canGoBack, isOnHomePage, location } = useNavigation();

  useEffect(() => {
    // Show emergency navigation if user has been on the same page for too long
    // or if they seem to be stuck (no navigation in 30 seconds)
    let timer: NodeJS.Timeout;
    
    const showNav = () => {
      // Don't show on home pages or welcome pages
      if (isOnHomePage() || location.pathname === '/' || location.pathname === '/role-select') {
        return;
      }
      
      timer = setTimeout(() => {
        setShowEmergencyNav(true);
      }, 30000); // Show after 30 seconds
    };

    showNav();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [location.pathname, isOnHomePage]);

  if (!showEmergencyNav) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Card className="bg-blue-50 border-blue-200 shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">Need Help?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmergencyNav(false)}
              className="h-6 w-6 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            {canGoBack() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  goBack();
                  setShowEmergencyNav(false);
                }}
                className="text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Back
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={() => {
                goToHome();
                setShowEmergencyNav(false);
              }}
              className="text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-3 h-3 mr-1" />
              Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 