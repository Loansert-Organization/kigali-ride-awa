import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocalization } from '@/hooks/useLocalization';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Error boundary component that uses localization
const ErrorBoundaryContent: React.FC<{ 
  hasError: boolean; 
  error?: Error; 
  errorInfo?: ErrorInfo;
  onReset: () => void;
  onReload: () => void;
  fallback?: ReactNode;
}> = ({ hasError, error, errorInfo, onReset, onReload, fallback }) => {
  const { t } = useLocalization();

  if (!hasError) return null;

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">{t('something_went_wrong')}</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {t('unexpected_error')}
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <summary className="cursor-pointer font-medium">{t('error_details')}</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {error.toString()}
                {errorInfo?.componentStack}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={onReset} 
              variant="outline" 
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('try_again')}
            </Button>
            <Button 
              onClick={onReload} 
              className="flex-1"
            >
              {t('reload_page')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service if available
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    return (
      <>
        <ErrorBoundaryContent
          hasError={this.state.hasError}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          fallback={this.props.fallback}
        />
        {!this.state.hasError && this.props.children}
      </>
    );
  }
}