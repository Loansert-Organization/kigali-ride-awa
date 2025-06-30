import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { AIContext } from "../_shared/types.ts";
import { captureError, logInfo } from "../_shared/logging.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate-limit bucket (in-memory)
const RATE_LIMIT = Number(Deno.env.get('AI_RATE_LIMIT') ?? '30'); // requests per minute per IP
const buckets: Map<string, { ts: number; count: number }> = new Map();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket) {
    buckets.set(ip, { ts: now, count: 1 });
    return false;
  }
  // reset window if >60s
  if (now - bucket.ts > 60_000) {
    bucket.ts = now;
    bucket.count = 1;
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

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
    'ui-suggestions': 'claude',
    'explain-error': 'gpt-4o',
    'categorize-incident': 'claude',
    'generate-suggestions': 'claude',
    'ux-recommendations': 'claude',
    'chat': 'gpt-4o-mini' // Use mini model for chat to reduce costs
  };
  
  return modelMap[taskType as keyof typeof modelMap] || 'gpt-4o';
}

async function callOpenAI(prompt: string, context: AIContext, messages?: any[]) {
  const systemMessage = {
    role: 'system',
    content: `You are a helpful AI assistant for Kigali Ride AWA, a ride-sharing app for Sub-Saharan Africa. 
You help users with:
- Planning trips and finding rides
- Understanding how to use the app
- Explaining pricing (typically 150 RWF per km, varies by country)
- Troubleshooting issues
- General questions about the service

Be friendly, concise, and helpful. Focus on practical solutions.`
  };

  const chatMessages = messages 
    ? [systemMessage, ...messages]
    : [systemMessage, { role: 'user', content: prompt }];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: context?.model || 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500, // Keep responses concise
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callClaude(prompt: string, context: AIContext) {
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

async function callGemini(prompt: string, context: AIContext) {
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
  try {
    // Rate-limit check
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (isRateLimited(ip)) {
      logInfo("rate limit", { ip });
      return new Response(JSON.stringify({ error: "rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const body = await req.json();
    
    // Handle chat action specifically
    if (body.action === 'chat') {
      const { messages } = body;
      
      try {
        const response = await callOpenAI('', { model: 'gpt-4o-mini' }, messages);
        
        return new Response(JSON.stringify({ 
          response,
          model: 'gpt-4o-mini',
          action: 'chat',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Chat error:', error);
        throw error;
      }
    }
    
    // Handle other AI tasks
    const { taskType, prompt, context, preferredModel, complexity } = body;
    
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
  } catch (err) {
    captureError(err as Error);
    return new Response(JSON.stringify({ error: 'internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
