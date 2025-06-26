
import React, { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface ErrorLogEntry {
  event_type: string;
  component: string;
  message: string;
  metadata?: Record<string, any>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

interface UseErrorHandlerOptions {
  onWhatsAppLogin?: () => void;
}

export const useErrorHandler = (options?: UseErrorHandlerOptions) => {
  const { user } = useAuth();

  const logError = useCallback(async (entry: ErrorLogEntry) => {
    try {
      const { error } = await supabase
        .from('agent_logs')
        .insert({
          user_id: user?.id || null,
          event_type: entry.event_type,
          component: entry.component,
          message: entry.message,
          metadata: entry.metadata || {},
          severity: entry.severity || 'error'
        });

      if (error) {
        console.error('Failed to log error:', error);
      }
    } catch (logError) {
      console.error('Error logging failed:', logError);
    }
  }, [user?.id]);

  const shouldShowWhatsAppLogin = useCallback((errorMessage: string): boolean => {
    const authRelatedKeywords = [
      'authentication',
      'login',
      'permission',
      'unauthorized',
      'verify',
      'phone',
      'whatsapp',
      'location',
      'access denied',
      'not authenticated',
      'session',
      'token'
    ];
    
    return authRelatedKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  const handleError = useCallback(async (
    error: any,
    component: string,
    context?: Record<string, any>
  ) => {
    const errorMessage = error?.message || 'An unexpected error occurred';
    
    // Log the error
    await logError({
      event_type: 'error',
      component,
      message: errorMessage,
      metadata: {
        error: error?.toString(),
        stack: error?.stack,
        context: context || {}
      },
      severity: 'error'
    });

    const displayMessage = getDisplayMessage(errorMessage);
    const showWhatsAppButton = shouldShowWhatsAppLogin(errorMessage) && options?.onWhatsAppLogin;

    // Show user-friendly toast with optional WhatsApp login action
    if (showWhatsAppButton) {
      toast({
        title: "Something went wrong",
        description: displayMessage,
        variant: "destructive",
        action: (
          <ToastAction
            altText="Login with WhatsApp"
            onClick={options.onWhatsAppLogin}
            className="text-xs"
          >
            📱 Login with WhatsApp
          </ToastAction>
        )
      });
    } else {
      toast({
        title: "Something went wrong",
        description: displayMessage,
        variant: "destructive"
      });
    }

    console.error(`Error in ${component}:`, error);
  }, [logError, shouldShowWhatsAppLogin, options?.onWhatsAppLogin]);

  const handleSuccess = useCallback(async (
    message: string,
    component: string,
    metadata?: Record<string, any>
  ) => {
    // Log success events
    await logError({
      event_type: 'success',
      component,
      message,
      metadata: metadata || {},
      severity: 'info'
    });

    toast({
      title: "Success",
      description: message,
    });
  }, [logError]);

  return { handleError, handleSuccess, logError };
};

// Helper function to convert technical errors to user-friendly messages
const getDisplayMessage = (errorMessage: string): string => {
  if (errorMessage.includes('network')) {
    return 'Please check your internet connection and try again';
  }
  if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
    return 'You don\'t have permission to perform this action';
  }
  if (errorMessage.includes('not found')) {
    return 'The requested information could not be found';
  }
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return 'Please check your input and try again';
  }
  if (errorMessage.includes('location') || errorMessage.includes('access denied')) {
    return 'Location access is required for this feature';
  }
  if (errorMessage.includes('authentication') || errorMessage.includes('login')) {
    return 'Please login to continue using this feature';
  }
  return 'Something went wrong. Please try again later';
};
