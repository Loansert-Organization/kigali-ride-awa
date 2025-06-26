
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Handle empty or invalid request body
    let requestBody;
    try {
      const text = await req.text();
      requestBody = text ? JSON.parse(text) : {};
      console.log('Raw request text:', text);
      console.log('Parsed request body:', requestBody);
    } catch (error) {
      console.error('Failed to parse request body:', error);
      requestBody = {};
    }

    const { task_type, payload } = requestBody;

    console.log('Queue worker processing request:', { 
      task_type, 
      payload, 
      hasTaskType: !!task_type,
      requestMethod: req.method,
      contentType: req.headers.get('content-type'),
      contentLength: req.headers.get('content-length')
    });

    // If no task_type is provided, check if we have any pending tasks in the database
    if (!task_type) {
      console.log('No task_type provided, checking for pending tasks...');
      return await processPendingTasks();
    }

    console.log('Queue worker processing task:', task_type, 'with payload:', payload)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (task_type) {
      case 'send_whatsapp_otp':
        return await handleWhatsAppOTP(payload, supabase)
      case 'send_whatsapp_notification':
        return await handleWhatsAppNotification(payload, supabase)
      default:
        console.warn(`Unknown task type: ${task_type}`)
        return new Response(
          JSON.stringify({ 
            success: true,
            message: `Unknown task type: ${task_type}`,
            processed: false
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
    }

  } catch (error) {
    console.error('Queue worker error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function processPendingTasks() {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Checking for pending OTP codes...');

    // Check for pending OTP codes that need to be sent
    const { data: pendingOTPs, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('sent', false)
      .gt('expires_at', new Date().toISOString())
      .limit(10)

    if (otpError) {
      console.error('Error fetching pending OTPs:', otpError)
    }

    let processed = 0;
    if (pendingOTPs && pendingOTPs.length > 0) {
      console.log(`Found ${pendingOTPs.length} pending OTP codes to process`)
      for (const otp of pendingOTPs) {
        try {
          await handleWhatsAppOTP({
            phone_number: otp.phone_number,
            user_id: otp.user_id,
            otp_code: otp.otp_code
          }, supabase)
          processed++
        } catch (error) {
          console.error('Failed to process OTP:', otp.id, error)
        }
      }
    } else {
      console.log('No pending OTP codes found');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Processed pending tasks',
        processed: processed
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing pending tasks:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

async function handleWhatsAppOTP(payload: any, supabase: any) {
  const { phone_number, user_id, otp_code } = payload

  if (!phone_number) {
    throw new Error('Phone number is required')
  }

  // Generate OTP code if not provided
  const otpCode = otp_code || Math.floor(100000 + Math.random() * 900000).toString()

  console.log('Processing WhatsApp OTP for phone:', phone_number, 'OTP:', otpCode);

  // Store OTP code in database if not already stored
  if (!otp_code) {
    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: phone_number,
        otp_code: otpCode,
        user_id: user_id,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        sent: false
      })

    if (otpError) {
      console.error('Failed to store OTP:', otpError)
      throw new Error(`Failed to store OTP: ${otpError.message}`)
    }
  }

  // Instead of sending directly, we'll call the send-whatsapp-template function
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp-template', {
      body: {
        phone_number: phone_number,
        user_id: user_id
      }
    });

    if (error) {
      console.error('Failed to invoke send-whatsapp-template:', error);
      throw error;
    }

    // Mark OTP as sent
    await supabase
      .from('otp_codes')
      .update({ sent: true })
      .eq('phone_number', phone_number)
      .eq('otp_code', otpCode);

    console.log('WhatsApp OTP sent successfully via template function');

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: data?.messageId,
        method: data?.method || 'template_function'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('WhatsApp send error:', error)
    throw error
  }
}

async function handleWhatsAppNotification(payload: any, supabase: any) {
  const { phone_number, message, user_id } = payload

  if (!phone_number || !message) {
    throw new Error('Phone number and message are required')
  }

  console.log('Processing WhatsApp notification for phone:', phone_number);

  const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN')
  const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
  
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials not configured')
  }

  const formattedPhone = phone_number.replace('+', '')
  
  const whatsappResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    })
  })

  const whatsappResult = await whatsappResponse.json()

  if (!whatsappResponse.ok) {
    throw new Error(`WhatsApp notification failed: ${whatsappResult.error?.message || 'Unknown error'}`)
  }

  console.log('WhatsApp notification sent successfully:', whatsappResult)

  return new Response(
    JSON.stringify({ 
      success: true, 
      messageId: whatsappResult.messages?.[0]?.id
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  )
}
