
import { supabase } from "@/integrations/supabase/client";

interface ErrorReport {
  component: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  user_id?: string;
  session_data?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class ErrorReportingService {
  static async reportError(error: Error, context: {
    component: string;
    user_id?: string;
    session_data?: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }) {
    try {
      const errorReport: ErrorReport = {
        component: context.component,
        error_type: error.name || 'UnknownError',
        message: error.message,
        stack_trace: error.stack,
        user_id: context.user_id,
        session_data: context.session_data,
        severity: context.severity || 'medium'
      };

      await supabase.functions.invoke('comprehensive-error-handler', {
        body: errorReport
      });

      console.log('Error reported successfully:', errorReport.component);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
      // Fallback to console logging
      console.error('Original error:', error);
      console.error('Context:', context);
    }
  }

  static async reportCriticalError(error: Error, context: {
    component: string;
    user_id?: string;
    session_data?: Record<string, any>;
  }) {
    return this.reportError(error, {
      ...context,
      severity: 'critical'
    });
  }
}
