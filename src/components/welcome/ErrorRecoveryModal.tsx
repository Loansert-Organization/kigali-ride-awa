
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorRecoveryModalProps {
  error: string;
  onRetry: () => void;
  onGoHome?: () => void;
  isRetrying?: boolean;
}

const ErrorRecoveryModal: React.FC<ErrorRecoveryModalProps> = ({
  error,
  onRetry,
  onGoHome,
  isRetrying = false
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-fade-in border-red-200">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Setup Issue
          </h2>
          
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            {error}
          </p>

          <div className="space-y-3">
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
            
            {onGoHome && (
              <Button 
                onClick={onGoHome}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </Button>
            )}
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">
              If the problem persists, please check your internet connection and try again later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorRecoveryModal;
