import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { useLocalization } from '@/hooks/useLocalization';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  showHome?: boolean;
  onBack?: () => void;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  showBack = true,
  showHome = true,
  onBack,
  className = ""
}) => {
  const { goBack, goToHome, canGoBack, isOnHomePage } = useNavigation();
  const { t } = useLocalization();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      goBack();
    }
  };

  const handleHome = () => {
    goToHome();
  };

  // Don't show home button if we're already on home page
  const shouldShowHome = showHome && !isOnHomePage();
  // Don't show back button if we can't go back and no custom handler
  const shouldShowBack = showBack && (canGoBack() || !!onBack);

  return (
    <div className={`bg-white border-b sticky top-0 z-10 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {shouldShowBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-3"
              aria-label={t('go_back')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        
        {shouldShowHome && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            aria-label={t('go_to_home')}
          >
            <Home className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}; 