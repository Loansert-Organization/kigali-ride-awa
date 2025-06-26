
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
    // Handle empty or invalid request body with detailed logging
    let requestBody;
    try {
      const text = await req.text();
      requestBody = text ? JSON.parse(text) : {};
      console.log('Queue worker received:', {
        method: req.method,
        contentType: req.headers.get('content-type'),
        contentLength: req.headers.get('content-length'),
        rawBody: text,
        parsedBody: requestBody
      });
    } catch (error) {
      console.error('Failed to parse request body:', error);
      requestBody = {};
    }

    const { task_type, payload } = requestBody;

    console.log('Processing task:', { 
      task_type, 
      payload,
      timestamp: new Date().toISOString()
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // If no task_type is provided, check for pending tasks
    if (!task_type) {
      console.log('No task_type provided, checking for pending tasks...');
      return await processPendingTasks(supabase);
    }

    switch (task_type) {
      case 'send_whatsapp_otp':
        return await handleWhatsAppOTP(payload, supabase)
      case 'send_whatsapp_notification':
        return await handleWhatsAppNotification(payload, supabase)
      default:
        console.warn(`Unknown task type: ${task_type}`);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Unknown task type: ${task_type}`,
            processed: false
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          },
        )
    }

  } catch (error) {
    console.error('Queue worker critical error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function processPendingTasks(supabase: any) {
  try {
    console.log('Checking for pending OTP codes...');

    // Check for pending OTP codes that need to be sent (now with correct schema)
    const { data: pendingOTPs, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('sent', false)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .limit(10)

    if (otpError) {
      console.error('Error fetching pending OTPs:', otpError);
      throw new Error(`OTP fetch error: ${otpError.message}`);
    }

    let processed = 0;
    if (pendingOTPs && pendingOTPs.length > 0) {
      console.log(`Found ${pendingOTPs.length} pending OTP codes to process`);
      for (const otp of pendingOTPs) {
        try {
          const result = await handleWhatsAppOTP({
            phone_number: otp.phone_number,
            user_id: otp.user_id,
            otp_code: otp.otp_code
          }, supabase);
          
          if (result.ok) {
            processed++;
          } else {
            console.error('Failed to process OTP:', otp.id, await result.text());
          }
        } catch (error) {
          console.error('Failed to process OTP:', otp.id, error);
        }
      }
    } else {
      console.log('No pending OTP codes found');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Processed pending tasks',
        processed: processed,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error processing pending tasks:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}

async function handleWhatsAppOTP(payload: any, supabase: any) {
  try {
    const { phone_number, user_id, otp_code } = payload;

    console.log('Processing WhatsApp OTP:', {
      phone_number,
      user_id,
      otp_code: otp_code ? 'provided' : 'will_generate',
      timestamp: new Date().toISOString()
    });

    if (!phone_number) {
      throw new Error('Phone number is required');
    }

    // Generate OTP code if not provided
    const otpCode = otp_code || Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP code in database if not already stored
    if (!otp_code) {
      const { error: otpError } = await supabase
        .from('otp_codes')
        .insert({
          phone_number: phone_number,
          otp_code: otpCode,
          user_id: user_id,
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
          sent: false,
          used: false
        });

      if (otpError) {
        console.error('Failed to store OTP:', otpError);
        throw new Error(`Failed to store OTP: ${otpError.message}`);
      }
    }

    // Call the send-whatsapp-template function with comprehensive error handling
    try {
      console.log('Invoking send-whatsapp-template function...');
      
      const { data, error } = await supabase.functions.invoke('send-whatsapp-template', {
        body: {
          phone_number: phone_number,
          user_id: user_id
        }
      });

      console.log('WhatsApp template function response:', { data, error });

      if (error) {
        console.error('send-whatsapp-template function error:', error);
        throw new Error(`WhatsApp template function error: ${JSON.stringify(error)}`);
      }

      if (data?.success) {
        // Mark OTP as sent
        const { error: updateError } = await supabase
          .from('otp_codes')
          .update({ sent: true })
          .eq('phone_number', phone_number)
          .eq('otp_code', otpCode);

        if (updateError) {
          console.error('Failed to update OTP sent status:', updateError);
        }

        console.log('WhatsApp OTP sent successfully:', {
          messageId: data.messageId,
          method: data.method,
          phone_number
        });

        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: data.messageId,
            method: data.method || 'template_function',
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      } else {
        throw new Error(`WhatsApp template function failed: ${data?.error || 'Unknown error'}`);
      }

    } catch (invokeError) {
      console.error('Failed to invoke send-whatsapp-template:', invokeError);
      throw new Error(`Function invocation failed: ${invokeError.message}`);
    }

  } catch (error) {
    console.error('WhatsApp OTP handler error:', {
      error: error.message,
      stack: error.stack,
      payload,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack,
        payload: payload,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
}

async function handleWhatsAppNotification(payload: any, supabase: any) {
  try {
    const { phone_number, message, user_id } = payload;

    console.log('Processing WhatsApp notification:', {
      phone_number,
      user_id,
      messageLength: message?.length,
      timestamp: new Date().toISOString()
    });

    if (!phone_number || !message) {
      throw new Error('Phone number and message are required');
    }

    // Check environment variables
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN');
    const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
      console.error('WhatsApp credentials missing:', {
        hasToken: !!WHATSAPP_TOKEN,
        hasPhoneId: !!PHONE_NUMBER_ID
      });
      throw new Error('WhatsApp API credentials not configured');
    }

    // Format phone number (remove + if present)
    const formattedPhone = phone_number.replace('+', '');
    
    console.log('Sending WhatsApp notification:', {
      to: formattedPhone,
      phoneNumberId: PHONE_NUMBER_ID,
      messagePreview: message.substring(0, 50) + '...'
    });

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
    });

    const whatsappResult = await whatsappResponse.json();

    console.log('WhatsApp API response:', {
      status: whatsappResponse.status,
      statusText: whatsappResponse.statusText,
      result: whatsappResult
    });

    if (!whatsappResponse.ok) {
      console.error('WhatsApp notification failed:', {
        status: whatsappResponse.status,
        error: whatsappResult.error,
        phone: formattedPhone
      });
      throw new Error(`WhatsApp notification failed: ${whatsappResult.error?.message || 'Unknown error'}`);
    }

    console.log('WhatsApp notification sent successfully:', whatsappResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: whatsappResult.messages?.[0]?.id,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('WhatsApp notification handler error:', {
      error: error.message,
      stack: error.stack,
      payload,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        stack: error.stack,
        payload: payload,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
}
