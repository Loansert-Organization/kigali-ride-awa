
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Settings, Wifi, Database } from 'lucide-react';

interface ErrorRecoveryScreenProps {
  error: string;
  onRetry: () => void;
  onHealthCheck?: () => void;
  isRetrying?: boolean;
  debugInfo?: any;
}

const ErrorRecoveryScreen: React.FC<ErrorRecoveryScreenProps> = ({
  error,
  onRetry,
  onHealthCheck,
  isRetrying = false,
  debugInfo
}) => {
  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('infinite recursion') || errorMessage.includes('policy')) {
      return 'database';
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'network';
    }
    if (errorMessage.includes('Backend') || errorMessage.includes('health check')) {
      return 'backend';
    }
    return 'general';
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-8 h-8 text-red-600" />;
      case 'network': return <Wifi className="w-8 h-8 text-red-600" />;
      case 'backend': return <Settings className="w-8 h-8 text-red-600" />;
      default: return <AlertTriangle className="w-8 h-8 text-red-600" />;
    }
  };

  const getErrorAdvice = (type: string) => {
    switch (type) {
      case 'database':
        return 'There seems to be a database configuration issue. This usually resolves automatically.';
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'backend':
        return 'Our backend services are temporarily unavailable. Please try again in a moment.';
      default:
        return 'Something unexpected happened. Please try again.';
    }
  };

  const errorType = getErrorType(error);
  const isDevelopment = import.meta.env.MODE === 'development';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in border-red-200 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
              {getErrorIcon(errorType)}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Setup Issue
          </h2>
          
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {getErrorAdvice(errorType)}
          </p>

          <div className="space-y-3 mb-6">
            <Button 
              onClick={onRetry}
              disabled={isRetrying}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            
            {onHealthCheck && (
              <Button 
                onClick={onHealthCheck}
                variant="outline"
                className="w-full"
              >
                <Settings className="w-4 h-4 mr-2" />
                Check Connection
              </Button>
            )}
          </div>

          {isDevelopment && debugInfo && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                Debug Information
              </summary>
              <div className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {error}
                </div>
                <div className="mb-2">
                  <strong>Environment:</strong> {debugInfo.environment || 'unknown'}
                </div>
                <div className="mb-2">
                  <strong>Supabase URL:</strong> {debugInfo.supabaseUrl ? 'configured' : 'missing'}
                </div>
                <div>
                  <strong>Auth Key:</strong> {debugInfo.authKey ? 'configured' : 'missing'}
                </div>
              </div>
            </details>
          )}

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              If the problem persists, please refresh the page or contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorRecoveryScreen;
