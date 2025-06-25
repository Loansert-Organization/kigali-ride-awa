
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI-powered incident categorization
async function categorizeIncident(message: string) {
  try {
    const aiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskType: 'categorize-incident',
        prompt: `Categorize this incident report into one of these categories: safety, fraud, payment, harassment, vehicle_issue, other. Also rate severity (low, medium, high) and suggest immediate actions.

Incident: "${message}"

Return JSON: {
  "category": "category_name",
  "severity": "low|medium|high", 
  "priority": 1-5,
  "suggested_actions": ["action1", "action2"],
  "requires_immediate_attention": boolean,
  "reasoning": "brief explanation"
}`,
        context: { type: 'incident_categorization' }
      }),
    });

    const data = await aiResponse.json();
    return JSON.parse(data.result);
  } catch (error) {
    console.warn('AI categorization failed:', error);
    return {
      category: 'other',
      severity: 'medium',
      priority: 3,
      suggested_actions: ['review_manually'],
      requires_immediate_attention: false,
      reasoning: 'Auto-categorization failed, requires manual review'
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { type, message, tripId, metadata } = await req.json();

    if (!type || !message) {
      throw new Error('Incident type and message are required');
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role, promo_code')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      throw new Error('User profile not found');
    }

    // AI categorization
    const aiAnalysis = await categorizeIncident(message);

    // Create incident record
    const incidentData = {
      user_id: userProfile.id,
      trip_id: tripId || null,
      type: type,
      message: message,
      metadata: {
        ...metadata,
        ai_analysis: aiAnalysis,
        user_agent: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        submitted_at: new Date().toISOString()
      }
    };

    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert(incidentData)
      .select()
      .single();

    if (incidentError) throw incidentError;

    // If high priority or immediate attention required, create admin notification
    if (aiAnalysis.requires_immediate_attention || aiAnalysis.severity === 'high') {
      console.error(`HIGH PRIORITY INCIDENT: ${incident.id} - ${aiAnalysis.category} - ${message}`);
      
      // In a real implementation, you would:
      // 1. Send email/SMS to admin team
      // 2. Create Slack/Discord notification
      // 3. Log to monitoring system (Sentry, etc.)
    }

    console.log(`Incident submitted: ${incident.id}, category: ${aiAnalysis.category}, severity: ${aiAnalysis.severity}`);

    return new Response(JSON.stringify({
      success: true,
      incident_id: incident.id,
      category: aiAnalysis.category,
      severity: aiAnalysis.severity,
      priority: aiAnalysis.priority,
      estimated_response_time: aiAnalysis.severity === 'high' ? '1-4 hours' : 
                               aiAnalysis.severity === 'medium' ? '24-48 hours' : '2-5 days',
      next_steps: aiAnalysis.suggested_actions,
      message: 'Incident report submitted successfully. Our team will review and respond accordingly.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in submit-incident-report:', error);
    return new Response(JSON.stringify({
      error: 'Incident submission failed',
      details: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
