
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
    const { phoneNumber, messageType, tripData, promoCode, language = 'en' } = await req.json();

    if (!phoneNumber || !messageType) {
      throw new Error('Phone number and message type are required');
    }

    // Message templates by type and language
    const messageTemplates = {
      trip_confirmation: {
        en: (data: any) => `🚗 Kigali Ride Trip Confirmed!\n\nFrom: ${data.from}\nTo: ${data.to}\nTime: ${data.time}\nVehicle: ${data.vehicle}\n\nDriver will contact you soon. Safe travels!`,
        kn: (data: any) => `🚗 Urugendo rwa Kigali Ride rwemejwe!\n\nKuva: ${data.from}\nKugera: ${data.to}\nIgihe: ${data.time}\nIkinyabiziga: ${data.vehicle}\n\nUmushoferi azakuvugisha vuba. Urugendo rumeze!`,
        fr: (data: any) => `🚗 Voyage Kigali Ride confirmé!\n\nDe: ${data.from}\nÀ: ${data.to}\nHeure: ${data.time}\nVéhicule: ${data.vehicle}\n\nLe conducteur vous contactera bientôt. Bon voyage!`
      },
      referral_invite: {
        en: (data: any) => `🎁 Join Kigali Ride and use my code ${data.promoCode} for rewards!\n\nDownload: ${data.appUrl}\n\nEarn points together when you complete your first ride!`,
        kn: (data: any) => `🎁 Jya muri Kigali Ride ukoreshe code yanje ${data.promoCode} kugira ngo ubone ibihembo!\n\nKuramo: ${data.appUrl}\n\nMubone amanota hamwe iyo urangije urugendo rwawe rwa mbere!`,
        fr: (data: any) => `🎁 Rejoignez Kigali Ride et utilisez mon code ${data.promoCode} pour des récompenses!\n\nTélécharger: ${data.appUrl}\n\nGagnez des points ensemble quand vous terminez votre premier voyage!`
      },
      booking_request: {
        en: (data: any) => `📍 New Booking Request via Kigali Ride\n\nPassenger wants to join your trip:\nFrom: ${data.from}\nTo: ${data.to}\nTime: ${data.time}\n\nReply to confirm or decline.`,
        kn: (data: any) => `📍 Icyifuzo gishya cyo gutwara vuba Kigali Ride\n\nUmugenzi ashaka kwinjira mu rugendo rwawe:\nKuva: ${data.from}\nKugera: ${data.to}\nIgihe: ${data.time}\n\nSubiza ukemera cyangwa uhakane.`,
        fr: (data: any) => `📍 Nouvelle demande de réservation via Kigali Ride\n\nPassager veut rejoindre votre voyage:\nDe: ${data.from}\nÀ: ${data.to}\nHeure: ${data.time}\n\nRépondez pour confirmer ou décliner.`
      }
    };

    const template = messageTemplates[messageType as keyof typeof messageTemplates];
    if (!template) {
      throw new Error('Invalid message type');
    }

    const langTemplate = template[language as keyof typeof template] || template.en;
    
    // Prepare message data
    const messageData = {
      from: tripData?.from_location || '',
      to: tripData?.to_location || '',
      time: tripData?.scheduled_time ? new Date(tripData.scheduled_time).toLocaleTimeString() : '',
      vehicle: tripData?.vehicle_type || '',
      promoCode: promoCode || '',
      appUrl: `${Deno.env.get('SITE_URL') || 'https://kigali-ride.app'}${promoCode ? `?promo=${promoCode}` : ''}`
    };

    const message = langTemplate(messageData);
    
    // Create WhatsApp URL
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;

    console.log(`WhatsApp invite prepared for ${phoneNumber}, type: ${messageType}, language: ${language}`);

    return new Response(JSON.stringify({
      success: true,
      whatsapp_url: whatsappUrl,
      message: message,
      message_type: messageType,
      language: language,
      phone_number: cleanPhoneNumber
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-whatsapp-invite:', error);
    return new Response(JSON.stringify({
      error: 'WhatsApp invite generation failed',
      details: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
