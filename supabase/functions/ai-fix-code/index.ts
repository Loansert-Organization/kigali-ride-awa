
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
    const { code, error, errorType, context } = await req.json();
    
    const prompt = `Fix this code issue:

ERROR TYPE: ${errorType || 'Unknown'}
ERROR MESSAGE: ${error}

CURRENT CODE:
\`\`\`
${code}
\`\`\`

CONTEXT: ${context || 'React TypeScript application'}

Please provide:
1. Fixed code
2. Explanation of what was wrong
3. Prevention tips for future

Format as JSON:
{
  "fixedCode": "...",
  "explanation": "...",
  "preventionTips": "..."
}`;

    const aiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskType: 'fix-code',
        prompt,
        context: { code, error, errorType }
      }),
    });

    const data = await aiResponse.json();
    
    // Try to parse as JSON, fallback to structured response
    let result;
    try {
      result = JSON.parse(data.result);
    } catch {
      result = {
        fixedCode: data.result,
        explanation: "Code fix generated",
        preventionTips: "Follow TypeScript best practices"
      };
    }

    return new Response(JSON.stringify({
      ...result,
      model: data.model,
      fixedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Code Fix Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Code fix failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
