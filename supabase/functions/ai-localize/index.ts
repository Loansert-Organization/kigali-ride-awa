
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
    const { text, targetLanguages, context, tone } = await req.json();
    
    const languages = targetLanguages || ['en', 'kn', 'fr']; // English, Kinyarwanda, French
    const prompt = `Translate the following text for a ride-booking app in Kigali, Rwanda.

Original text: "${text}"
Context: ${context || 'Mobile app UI text'}
Tone: ${tone || 'friendly and professional'}

Translate to:
- English (en): Natural, clear English
- Kinyarwanda (kn): Local Rwandan language, culturally appropriate
- French (fr): Clear French, commonly used in Rwanda

Consider:
- Mobile app constraints (keep translations concise)
- Cultural context of Kigali/Rwanda
- User experience for ride booking
- Formal vs informal tone as appropriate

Return as JSON:
{
  "en": "English translation",
  "kn": "Kinyarwanda translation", 
  "fr": "French translation"
}`;

    const aiResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-router`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskType: 'localize',
        prompt,
        context: { text, targetLanguages, context, tone }
      }),
    });

    const data = await aiResponse.json();
    
    let translations;
    try {
      translations = JSON.parse(data.result);
    } catch {
      // Fallback if JSON parsing fails
      translations = {
        en: text,
        kn: text,
        fr: text
      };
    }

    return new Response(JSON.stringify({
      originalText: text,
      translations,
      model: data.model,
      translatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Localization Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Localization failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
