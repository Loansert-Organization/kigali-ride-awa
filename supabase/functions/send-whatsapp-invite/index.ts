
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
    const { phoneNumber, message } = await req.json();
    
    if (!phoneNumber || !message) {
      throw new Error('Phone number and message are required');
    }

    // Clean phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    // Generate WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('Generated WhatsApp URL:', whatsappUrl);

    return new Response(JSON.stringify({
      success: true,
      whatsapp_url: whatsappUrl,
      phone_number: cleanPhone,
      message: message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-whatsapp-invite:', error);
    return new Response(JSON.stringify({
      error: 'WhatsApp invite generation failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
