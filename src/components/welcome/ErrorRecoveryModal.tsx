
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorRecoveryModalProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const ErrorRecoveryModal: React.FC<ErrorRecoveryModalProps> = ({ 
  error, 
  onRetry, 
  isRetrying = false 
}) => {
  // Determine error type and provide appropriate message
  const getErrorInfo = (errorMessage: string) => {
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return {
        title: 'Connection Issue',
        message: 'Having trouble connecting to our servers. Please check your internet connection and try again.',
        suggestion: 'Make sure you have a stable internet connection.'
      };
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('longer than expected')) {
      return {
        title: 'Loading Timeout',
        message: 'Setup is taking longer than usual. This might be due to slow network conditions.',
        suggestion: 'Please try again or check your network connection.'
      };
    }
    
    if (errorMessage.includes('authentication') || errorMessage.includes('auth')) {
      return {
        title: 'Authentication Issue',
        message: 'There was a problem setting up your account. This is usually temporary.',
        suggestion: 'Please try again in a moment.'
      };
    }
    
    if (errorMessage.includes('database') || errorMessage.includes('policy')) {
      return {
        title: 'Service Issue',
        message: 'Our services are temporarily experiencing issues. This should resolve shortly.',
        suggestion: 'Please try again in a few moments.'
      };
    }
    
    return {
      title: 'Setup Error',
      message: 'Something went wrong during setup. This is usually temporary.',
      suggestion: 'Please try again.'
    };
  };

  const errorInfo = getErrorInfo(error);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">{errorInfo.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{errorInfo.message}</p>
          <p className="text-sm text-gray-500">{errorInfo.suggestion}</p>
          
          <Button 
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
          
          <details className="text-left">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-600">
              Technical Details
            </summary>
            <pre className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-20">
              {error}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorRecoveryModal;
