import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const logError = useCallback((error: Error | ApiError, context?: ErrorContext) => {
    console.error('Application Error:', {
      error: error.message,
      stack: 'stack' in error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString()
    });

    // Send to backend logging service if available
    // apiClient.logging.logError({ error, context }).catch(console.error);
  }, []);

  const handleError = useCallback((
    error: Error | ApiError | unknown,
    context?: ErrorContext,
    showToast = true
  ) => {
    let errorMessage = 'An unexpected error occurred';
    let errorCode: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as ApiError).message;
      errorCode = (error as ApiError).code;
    }

    // Log the error
    logError(error as Error | ApiError, context);

    // Show user-friendly toast
    if (showToast) {
      toast({
        title: "Error",
        description: getUserFriendlyMessage(errorMessage, errorCode),
        variant: "destructive"
      });
    }

    return {
      message: errorMessage,
      code: errorCode,
      userMessage: getUserFriendlyMessage(errorMessage, errorCode)
    };
  }, [logError, toast]);

  const getUserFriendlyMessage = (message: string, code?: string): string => {
    // Map common error codes/messages to user-friendly versions
    const errorMap: Record<string, string> = {
      'NETWORK_ERROR': 'Please check your internet connection and try again',
      'UNAUTHORIZED': 'Please sign in to continue',
      'FORBIDDEN': 'You don\'t have permission to perform this action',
      'NOT_FOUND': 'The requested information could not be found',
      'VALIDATION_ERROR': 'Please check your input and try again',
      'SERVER_ERROR': 'Our servers are experiencing issues. Please try again later',
      'RATE_LIMITED': 'Too many requests. Please wait a moment and try again'
    };

    if (code && errorMap[code]) {
      return errorMap[code];
    }

    // Check for common patterns in messages
    if (message.toLowerCase().includes('network')) {
      return 'Network connection issue. Please try again';
    }
    if (message.toLowerCase().includes('permission')) {
      return 'You don\'t have permission for this action';
    }
    if (message.toLowerCase().includes('validation')) {
      return 'Please check your input and try again';
    }

    return message || 'Something went wrong. Please try again';
  };

  return {
    handleError,
    logError
  };
};