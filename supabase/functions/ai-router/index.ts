
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model selection logic based on task type
function selectModel(taskType: string, complexity: 'simple' | 'medium' | 'complex' = 'medium'): string {
  const modelMap = {
    'code-generation': complexity === 'complex' ? 'claude' : 'gpt-4o',
    'lint-code': 'gpt-4o',
    'fix-code': 'gpt-4o', 
    'self-heal': 'claude',
    'scaffold-feature': 'claude',
    'db-review': 'claude',
    'docs': 'claude',
    'localize': 'gemini',
    'fraud-check': 'gemini',
    'ui-suggestions': 'claude'
  };
  
  return modelMap[taskType as keyof typeof modelMap] || 'gpt-4o';
}

async function callOpenAI(prompt: string, context: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert developer assistant specializing in React, TypeScript, and Supabase.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(prompt: string, context: any) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [
        { role: 'user', content: prompt }
      ],
    }),
  });
  
  const data = await response.json();
  return data.content[0].text;
}

async function callGemini(prompt: string, context: any) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GOOGLE_API_KEY')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4000,
      }
    }),
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { taskType, prompt, context, preferredModel, complexity } = await req.json();
    
    console.log(`AI Router: ${taskType} with ${preferredModel || 'auto'} model`);
    
    const selectedModel = preferredModel || selectModel(taskType, complexity);
    let result;
    
    try {
      switch (selectedModel) {
        case 'claude':
          result = await callClaude(prompt, context);
          break;
        case 'gemini':
          result = await callGemini(prompt, context);
          break;
        default:
          result = await callOpenAI(prompt, context);
      }
    } catch (primaryError) {
      console.error(`Primary model ${selectedModel} failed:`, primaryError);
      // Fallback to GPT-4o
      if (selectedModel !== 'gpt-4o') {
        result = await callOpenAI(prompt, context);
      } else {
        throw primaryError;
      }
    }

    return new Response(JSON.stringify({ 
      result, 
      model: selectedModel,
      taskType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI Router Error:', error);
    return new Response(JSON.stringify({ 
      error: 'AI processing failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
