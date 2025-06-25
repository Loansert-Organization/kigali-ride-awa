
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
    const { requirement, codeType, context, framework } = await req.json();
    
    const systemPrompt = `You are an expert developer assistant. Generate clean, production-ready code.
    
Framework: ${framework || 'React with TypeScript'}
Code Type: ${codeType || 'component'}
Context: ${context || 'Kigali Ride booking app'}

Requirements:
- Follow best practices and patterns
- Include proper TypeScript types
- Add error handling where appropriate
- Make it mobile-first and accessible
- Include comments for complex logic
- Use modern React patterns (hooks, functional components)

Generate only the code without explanations unless specifically requested.`;

    const prompt = `${systemPrompt}\n\nRequirement: ${requirement}`;

    // Route to AI router for model selection
    const aiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskType: 'code-generation',
        prompt,
        context: { codeType, framework, requirement },
        complexity: requirement.length > 200 ? 'complex' : 'medium'
      }),
    });

    const data = await aiResponse.json();

    return new Response(JSON.stringify({
      code: data.result,
      model: data.model,
      codeType,
      framework,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Code Generation Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Code generation failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
