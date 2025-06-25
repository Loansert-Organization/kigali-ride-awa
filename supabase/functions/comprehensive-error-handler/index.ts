
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ErrorReport {
  component: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  user_id?: string;
  session_data?: Record<string, any>;
  url?: string;
  user_agent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const errorReport = await req.json() as ErrorReport

    console.log('Processing error report:', errorReport.component, errorReport.error_type)

    // Store error in agent_logs table
    const { error: logError } = await supabase
      .from('agent_logs')
      .insert({
        component: errorReport.component,
        event_type: 'error',
        severity: errorReport.severity,
        message: errorReport.message,
        user_id: errorReport.user_id || null,
        metadata: {
          error_type: errorReport.error_type,
          stack_trace: errorReport.stack_trace,
          session_data: errorReport.session_data,
          url: errorReport.url,
          user_agent: errorReport.user_agent,
          timestamp: new Date().toISOString()
        }
      })

    if (logError) {
      console.error('Error storing log:', logError)
    }

    // Handle critical errors
    if (errorReport.severity === 'critical') {
      await handleCriticalError(supabase, errorReport)
    }

    // Auto-recovery attempts for common errors
    const recoveryAction = await attemptAutoRecovery(supabase, errorReport)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Error report processed',
        recovery_attempted: recoveryAction,
        severity: errorReport.severity
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error handler error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleCriticalError(supabase: any, errorReport: ErrorReport) {
  try {
    // Send immediate notification for critical errors
    if (errorReport.user_id) {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: errorReport.user_id,
          title: 'Service Issue Detected',
          body: 'We detected an issue and are working to resolve it. Please try again in a few moments.',
          type: 'general'
        }
      })
    }

    console.log('Critical error handled:', errorReport.component)
  } catch (error) {
    console.error('Error handling critical error:', error)
  }
}

async function attemptAutoRecovery(supabase: any, errorReport: ErrorReport): Promise<string | null> {
  try {
    switch (errorReport.error_type) {
      case 'auth_session_expired':
        return 'session_refresh_suggested'
      
      case 'network_error':
        return 'retry_with_backoff'
      
      case 'permission_denied':
        if (errorReport.user_id) {
          // Check if user session needs refreshing
          const { data: user } = await supabase
            .from('users')
            .select('id, auth_user_id')
            .eq('id', errorReport.user_id)
            .single()
          
          if (!user?.auth_user_id) {
            return 'anonymous_session_recovery'
          }
        }
        return 'permission_check_required'
      
      case 'database_connection':
        return 'database_retry_scheduled'
      
      default:
        return null
    }
  } catch (error) {
    console.error('Auto-recovery error:', error)
    return null
  }
}
