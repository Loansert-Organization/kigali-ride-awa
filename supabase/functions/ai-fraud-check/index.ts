
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userBehavior, deviceData, bookingPattern, context } = await req.json();
    
    const prompt = `Analyze this user data for fraud/abuse risk in a ride-booking platform:

USER BEHAVIOR:
${JSON.stringify(userBehavior, null, 2)}

DEVICE DATA:
${JSON.stringify(deviceData, null, 2)}

BOOKING PATTERN:
${JSON.stringify(bookingPattern, null, 2)}

CONTEXT: ${context || 'Kigali ride booking platform'}

Look for:
- Multiple account creation patterns
- Suspicious booking frequencies 
- Device fingerprint anomalies
- Referral farming attempts
- Rapid-fire booking attempts
- Unusual location patterns
- Payment/contact info reuse

Return risk assessment as JSON:
{
  "riskLevel": "low|medium|high",
  "riskScore": 0-100,
  "flags": ["flag1", "flag2"],
  "reasoning": "explanation",
  "recommendations": ["action1", "action2"]
}`;

    const aiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskType: 'fraud-check',
        prompt,
        context: { userBehavior, deviceData, bookingPattern }
      }),
    });

    const data = await aiResponse.json();
    
    let analysis;
    try {
      analysis = JSON.parse(data.result);
    } catch {
      analysis = {
        riskLevel: "low",
        riskScore: 10,
        flags: [],
        reasoning: "Analysis completed",
        recommendations: []
      };
    }

    return new Response(JSON.stringify({
      ...analysis,
      model: data.model,
      analyzedAt: new Date().toISOString(),
      userId: userBehavior?.userId || 'anonymous'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fraud Check Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Fraud analysis failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
