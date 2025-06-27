
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
    const { phone_number, user_id } = await req.json();

    console.log('WhatsApp template request received:', {
      phone_number,
      user_id,
      timestamp: new Date().toISOString()
    });

    if (!phone_number) {
      throw new Error('Phone number is required');
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Store OTP code in database
    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        phone_number,
        otp_code: otpCode,
        user_id,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        sent: false,
        used: false
      });

    if (otpError) {
      console.error('Failed to store OTP:', otpError);
      throw new Error(`Failed to store OTP: ${otpError.message}`);
    }

    // Check WhatsApp API credentials with detailed logging
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN');
    const PHONE_NUMBER_ID = '396791596844039'; // Updated Phone Number ID
    
    console.log('WhatsApp credentials check:', {
      hasToken: !!WHATSAPP_TOKEN,
      phoneNumberId: PHONE_NUMBER_ID,
      tokenLength: WHATSAPP_TOKEN ? WHATSAPP_TOKEN.length : 0
    });
    
    if (!WHATSAPP_TOKEN) {
      throw new Error(`WhatsApp API credentials not configured: Token=${!!WHATSAPP_TOKEN}`);
    }

    // Format phone number (remove + if present, ensure it's E.164 compatible)
    let formattedPhone = phone_number.replace('+', '');
    
    // Ensure Rwanda numbers start with 250
    if (formattedPhone.startsWith('788') || formattedPhone.startsWith('789') || formattedPhone.startsWith('780')) {
      formattedPhone = `250${  formattedPhone}`;
    }
    
    console.log('Phone number formatting:', {
      original: phone_number,
      formatted: formattedPhone,
      isRwanda: formattedPhone.startsWith('250')
    });

    console.log('Sending WhatsApp template:', {
      to: formattedPhone,
      otpCode,
      phoneNumberId: PHONE_NUMBER_ID,
      templateName: 'autho_rw',
      timestamp: new Date().toISOString()
    });

    // Try template message first with updated template name
    try {
      const templateResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'template',
          template: {
            name: 'autho_rw', // Updated template name
            language: {
              code: 'en'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: otpCode
                  }
                ]
              }
            ]
          }
        })
      });

      const templateResult = await templateResponse.json();

      console.log('WhatsApp template API response:', {
        status: templateResponse.status,
        statusText: templateResponse.statusText,
        headers: Object.fromEntries(templateResponse.headers.entries()),
        result: templateResult
      });

      if (templateResponse.ok && templateResult.messages?.[0]?.id) {
        console.log('Template message sent successfully:', templateResult);
        
        // Mark OTP as sent
        await supabase
          .from('otp_codes')
          .update({ sent: true })
          .eq('phone_number', phone_number)
          .eq('otp_code', otpCode);

        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: templateResult.messages[0].id,
            method: 'template',
            templateName: 'autho_rw',
            phoneNumberId: PHONE_NUMBER_ID,
            timestamp: new Date().toISOString()
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        );
      } else {
        console.error('Template failed, attempting text fallback:', templateResult);
        
        // Fall back to text message
        const textResponse = await fetch(`https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`, {
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
              body: `🚗 *Kigali Ride* - Muraho! Welcome!\n\n*Your verification code:* ${otpCode}\n\nUwakangye neza ku Kigali Ride - igikoresho cyawe cyo gushaka n'ugutanga amatwara mu Kigali.\n\n*This code expires in 10 minutes.*\n\nMurakoze! 🇷🇼`
            }
          })
        });
        
        const textResult = await textResponse.json();
        
        console.log('WhatsApp text fallback response:', {
          status: textResponse.status,
          statusText: textResponse.statusText,
          result: textResult
        });
        
        if (textResponse.ok && textResult.messages?.[0]?.id) {
          console.log('Text message sent successfully:', textResult);
          
          // Mark OTP as sent
          await supabase
            .from('otp_codes')
            .update({ sent: true })
            .eq('phone_number', phone_number)
            .eq('otp_code', otpCode);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              messageId: textResult.messages[0].id,
              method: 'text_fallback',
              phoneNumberId: PHONE_NUMBER_ID,
              timestamp: new Date().toISOString()
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            },
          );
        } else {
          throw new Error(`Both template and text message failed: Template=${JSON.stringify(templateResult)}, Text=${JSON.stringify(textResult)}`);
        }
      }
    } catch (networkError) {
      console.error('Network error calling WhatsApp API:', {
        error: networkError.message,
        stack: networkError.stack
      });
      throw new Error(`WhatsApp API network error: ${networkError.message}`);
    }

  } catch (error) {
    console.error('Send WhatsApp template error:', {
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
    );
  }
});
