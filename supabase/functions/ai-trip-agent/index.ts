import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://esm.sh/openai@4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize OpenAI and Supabase clients
const openai = new OpenAI({ 
  apiKey: Deno.env.get('OPENAI_API_KEY') || ''
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// simple in-memory IP rate-limit: 30 requests / min
const ipBucket = new Map<string, { c: number; t: number }>();
function isRateLimited(ip: string) {
  const now = Date.now();
  const entry = ipBucket.get(ip) ?? { c: 0, t: now + 60_000 };
  if (now > entry.t) { entry.c = 0; entry.t = now + 60_000; }
  if (++entry.c > 30) { ipBucket.set(ip, entry); return true; }
  ipBucket.set(ip, entry); return false;
}

// Helper: Generate embeddings for route similarity
async function generateRouteEmbedding(origin: string, destination: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: `Route from ${origin} to ${destination}`,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return [];
  }
}

// Helper: Get user's routine suggestions based on patterns
async function getRoutineSuggestions(userId: string) {
  try {
    // Get user's common routines
    const { data: routines, error } = await supabase
      .rpc('get_user_routines', { p_user_id: userId });

    if (error || !routines) return [];

    // Get current time pattern
    const now = new Date();
    const hour = now.getHours();
    const dayType = now.getDay() === 0 || now.getDay() === 6 ? 'weekend' : 'weekday';
    
    let timeSlot = 'morning';
    if (hour >= 9 && hour < 12) timeSlot = 'late_morning';
    else if (hour >= 12 && hour < 14) timeSlot = 'lunch';
    else if (hour >= 14 && hour < 17) timeSlot = 'afternoon';
    else if (hour >= 17 && hour < 20) timeSlot = 'evening';
    else if (hour >= 20 && hour < 23) timeSlot = 'night';
    else if (hour >= 23 || hour < 5) timeSlot = 'late_night';

    const currentPattern = `${dayType}_${timeSlot}`;

    // Find matching routines
    const relevantRoutines = routines.filter((r: any) => 
      r.time_pattern === currentPattern && r.trip_count >= 2
    );

    return relevantRoutines.slice(0, 3);
  } catch (error) {
    console.error('Error getting routine suggestions:', error);
    return [];
  }
}

// Helper: Moderate user input
async function moderateContent(content: string): Promise<boolean> {
  try {
    const moderation = await openai.moderations.create({
      input: content,
    });
    
    return !moderation.results[0].flagged;
  } catch (error) {
    console.error('Moderation error:', error);
    return true; // Allow on error
  }
}

// Helper: Get or create AI thread for user
async function getOrCreateThread(userId: string): Promise<string | null> {
  try {
    // Check if user has existing thread
    const { data: existingThread } = await supabase
      .from('ai_threads')
      .select('openai_thread_id')
      .eq('user_id', userId)
      .single();

    if (existingThread?.openai_thread_id) {
      // Update last active
      await supabase
        .from('ai_threads')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', userId);
      
      return existingThread.openai_thread_id;
    }

    // Create new thread
    const thread = await openai.beta.threads.create();
    
    await supabase
      .from('ai_threads')
      .insert({
        user_id: userId,
        openai_thread_id: thread.id,
        metadata: { created_via: 'ai-trip-agent' }
      });

    return thread.id;
  } catch (error) {
    console.error('Thread management error:', error);
    return null;
  }
}

// Helper: convert payload to DB row
function mapPayloadToDB(userId: string, p: any) {
  return {
    creator_id: userId,
    role: p.role,
    origin_text: p.origin_text,
    dest_text: p.dest_text,
    departure_time: p.departure_time,
    currency: 'RWF',
    status: 'open',
    ...(p.role === 'driver' ? {
      seats_offered: p.seats || 1,
      vehicle_type: p.vehicle_type || 'any'
    } : {
      seats_needed: p.seats || 1
    })
  };
}

// Helper: save history
async function saveTripHistory(userId: string, payload: any) {
  await supabase.from('user_trip_history').insert({
    user_id: userId,
    role: payload.role,
    origin_text: payload.origin_text,
    dest_text: payload.dest_text,
    departure_time: payload.departure_time,
    seats: payload.seats,
    vehicle_type: payload.vehicle_type,
    country: 'RW'
  });
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, context, action, data } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    const ip = req.headers.get('x-forwarded-for')||'local';
    if(isRateLimited(ip)) return new Response('Too many requests', {status:429, headers:corsHeaders});

    // Handle different actions
    switch (action) {
      case 'chat':
        return await handleChat(userId, message, context);
      
      case 'voice_to_text':
        return await handleVoiceToText(userId, data);
      
      case 'text_to_speech':
        return await handleTextToSpeech(data.text, data.voice);
      
      case 'analyze_image':
        return await handleImageAnalysis(userId, data);
      
      case 'generate_suggestions':
        return await handleProactiveSuggestions(userId);
      
      default:
        return await handleChat(userId, message, context);
    }

  } catch (error) {
    console.error('AI Trip Agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Chat handler with function calling
async function handleChat(userId: string, message: string, context: any[] = []) {
  try {
    // Moderate user input
    const isSafe = await moderateContent(message);
    if (!isSafe) {
      return new Response(
        JSON.stringify({ 
          assistant: { 
            content: "I cannot process that message. Please keep our conversation appropriate." 
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save user message
    await supabase
      .from('dialog_messages')
      .insert({ 
        user_id: userId, 
        role: 'user', 
        content: message 
      });

    // Get recent conversation history
    const { data: history } = await supabase
      .from('dialog_messages')
      .select('role, content')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get user routines for context
    const routines = await getRoutineSuggestions(userId);
    
    // Get user's country for localization
    const { data: userData } = await supabase
      .from('users')
      .select('country, promo_code')
      .eq('id', userId)
      .single();

    const userCountry = userData?.country || 'RW';
    const currentTime = new Date().toLocaleString('en-US', { 
      timeZone: 'Africa/Kigali',
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'long'
    });

    // Compose system prompt
    const systemPrompt = `You are the Kigali Ride AI Trip Assistant, helping users across Sub-Saharan Africa plan their trips.

Current context:
- User's country: ${userCountry}
- Current time: ${currentTime}
- User's recent patterns: ${JSON.stringify(routines)}

Your capabilities:
1. Create trip drafts (driver or passenger)
2. Suggest routes based on user patterns
3. Provide real-time trip assistance
4. Answer questions about the service

Be friendly, concise, and proactive. When users express travel intent, use the draftTrip function.
Always consider the user's country for location suggestions and currency.`;

    // Call OpenAI Chat Completion with function calling
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...(history?.reverse() || []),
        { role: 'user', content: message }
      ],
      functions: [
        {
          name: 'draftTrip',
          description: 'Create a draft trip for the user',
          parameters: {
            type: 'object',
            properties: {
              role: { 
                type: 'string', 
                enum: ['driver', 'passenger'],
                description: 'Whether user is offering a ride (driver) or requesting one (passenger)'
              },
              origin_text: { 
                type: 'string',
                description: 'Starting location as text'
              },
              dest_text: { 
                type: 'string',
                description: 'Destination as text'
              },
              departure_time: { 
                type: 'string',
                format: 'date-time',
                description: 'ISO datetime for departure'
              },
              seats: { 
                type: 'integer',
                minimum: 1,
                maximum: 8,
                description: 'Number of seats (for drivers: available, for passengers: needed)'
              },
              vehicle_type: {
                type: 'string',
                enum: ['moto', 'car', 'tuktuk', 'minibus', 'any'],
                description: 'Type of vehicle'
              }
            },
            required: ['role', 'origin_text', 'dest_text']
          }
        },
        {
          name: 'publishTrip',
          description: 'Publish a trip immediately',
          parameters: {
            type: 'object',
            properties: {
              draft_id: { type: 'string', description: 'Existing draft id to publish' },
              role: { type: 'string', enum: ['driver','passenger'] },
              origin_text: { type: 'string' },
              dest_text: { type: 'string' },
              departure_time: { type: 'string', format: 'date-time' },
              seats: { type: 'integer' },
              vehicle_type: { type: 'string' }
            }
          }
        }
      ],
      function_call: 'auto'
    });

    const reply = completion.choices[0].message;

    // Handle function call if present
    if (reply.function_call?.name === 'draftTrip') {
      const args = JSON.parse(reply.function_call.arguments || '{}');
      
      // Generate embedding for the route
      const embedding = await generateRouteEmbedding(args.origin_text, args.dest_text);
      
      // Save to draft trips
      const { data: draft, error } = await supabase
        .from('ai_draft_trips')
        .insert({
          user_id: userId,
          payload: args,
          generated_for: new Date().toISOString(),
          confidence_score: 0.85,
          suggestion_reason: 'User requested via chat'
        })
        .select()
        .single();

      if (!error && draft) {
        // Add trip creation confirmation to response
        reply.content = (reply.content || '') + 
          `\n\n✅ I've created a draft trip for you! You'll see it at the top of your screen.`;
      }
    }

    // Handle publishTrip
    if (reply.function_call?.name === 'publishTrip') {
      const args = JSON.parse(reply.function_call.arguments || '{}');
      let payload = args;
      if (args.draft_id) {
        const { data: draftRow } = await supabase.from('ai_draft_trips').select('payload').eq('id', args.draft_id).single();
        if (draftRow) payload = { ...draftRow.payload, ...args }; // allow overrides
      }

      // insert into trips_wizard
      const { data: trip } = await supabase.from('trips_wizard').insert(mapPayloadToDB(userId, payload)).select().single();
      // mark draft accepted
      if (args.draft_id) await supabase.from('ai_draft_trips').update({ status: 'accepted' }).eq('id', args.draft_id);
      // history
      await saveTripHistory(userId, payload);

      reply.content = `✅ Your trip has been published! It departs ${payload.departure_time}. Share code: ${trip?.id.slice(0,6)}`;
      reply.metadata = { trip_published: true, trip_id: trip?.id, summary: payload } as any;
    }

    // Log AI token usage cost
    if (completion.usage) {
      const u: any = completion.usage;
      await supabase.from('ai_usage').insert({
        user_id: userId,
        prompt_tokens: u.prompt_tokens,
        completion_tokens: u.completion_tokens,
        usd: Number(((u.total_tokens / 1000) * 0.005).toFixed(4))
      });
    }

    // Save assistant reply
    await supabase
      .from('dialog_messages')
      .insert({ 
        user_id: userId, 
        role: 'assistant', 
        content: reply.content,
        metadata: reply.function_call ? { function_call: reply.function_call } : null
      });

    return new Response(
      JSON.stringify({ assistant: reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat handler error:', error);
    throw error;
  }
}

// Voice to text handler
async function handleVoiceToText(userId: string, data: any) {
  try {
    const { audioBase64, language = 'en' } = data;
    
    // Convert base64 to File
    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
    const audioFile = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language,
    });

    // Save transcription
    await supabase
      .from('voice_transcriptions')
      .insert({
        user_id: userId,
        transcription: transcription.text,
        language,
      });

    return new Response(
      JSON.stringify({ 
        transcription: transcription.text,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Voice transcription error:', error);
    throw error;
  }
}

// Text to speech handler
async function handleTextToSpeech(text: string, voice: string = 'alloy') {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as any,
      input: text,
    });

    const buffer = await mp3.arrayBuffer();
    
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    throw error;
  }
}

// Image analysis handler (for receipts, QR codes, etc.)
async function handleImageAnalysis(userId: string, data: any) {
  try {
    const { imageBase64, prompt = "What's in this image?" } = data;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    return new Response(
      JSON.stringify({ 
        analysis: response.choices[0].message.content,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
}

// Proactive suggestions handler
async function handleProactiveSuggestions(userId: string) {
  try {
    const routines = await getRoutineSuggestions(userId);
    
    if (routines.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [], message: 'No patterns found yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate suggestions based on routines
    const suggestions = [];
    
    for (const routine of routines) {
      // Calculate next occurrence
      const now = new Date();
      const [hours, minutes] = routine.avg_departure_time.split(':');
      const suggestedTime = new Date(now);
      suggestedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If time has passed today, suggest for tomorrow
      if (suggestedTime < now) {
        suggestedTime.setDate(suggestedTime.getDate() + 1);
      }

      const draft = {
        role: 'passenger', // Default to passenger for suggestions
        origin_text: routine.common_origin,
        dest_text: routine.common_dest,
        departure_time: suggestedTime.toISOString(),
        seats: 1,
        confidence: routine.trip_count / 10, // Higher count = higher confidence
      };

      // Save draft
      await supabase
        .from('ai_draft_trips')
        .insert({
          user_id: userId,
          payload: draft,
          generated_for: suggestedTime.toISOString(),
          confidence_score: draft.confidence,
          suggestion_reason: `Based on your ${routine.time_pattern} routine (${routine.trip_count} similar trips)`
        });

      suggestions.push(draft);
    }

    return new Response(
      JSON.stringify({ 
        suggestions,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Proactive suggestions error:', error);
    throw error;
  }
} 