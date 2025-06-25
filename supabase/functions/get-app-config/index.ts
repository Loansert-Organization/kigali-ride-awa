
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
    // App configuration with feature flags and settings
    const config = {
      app: {
        name: 'Kigali Ride',
        version: '1.0.0',
        environment: Deno.env.get('ENVIRONMENT') || 'production',
        support_email: 'support@kigaliride.app',
        support_phone: '+250788000000'
      },
      features: {
        ai_suggestions: true,
        real_time_tracking: false, // Future feature
        in_app_payments: false, // Cash/MoMo only for now
        voice_directions: false, // Future feature
        offline_mode: true,
        multi_language: true,
        referral_system: true,
        leaderboard: true,
        fraud_detection: true,
        driver_ratings: false, // Future feature
        passenger_ratings: false, // Future feature
        trip_sharing: true,
        emergency_button: false // Future feature
      },
      limits: {
        max_trip_distance: 100, // km
        max_scheduled_hours: 24, // hours in advance
        max_daily_trips: 20,
        referral_points_cap: 100, // per week
        search_radius: 50, // km
        trip_history_days: 90
      },
      pricing: {
        currency: 'RWF',
        payment_methods: ['cash', 'momo'],
        surge_pricing: false,
        fare_estimation: false // Negotiable fares for now
      },
      maps: {
        default_center: {
          lat: -1.9441,
          lng: 30.0619 // Kigali city center
        },
        default_zoom: 12,
        clustering_enabled: true,
        offline_tiles: false
      },
      languages: {
        supported: ['en', 'kn', 'fr'],
        default: 'en',
        rtl_support: false
      },
      notifications: {
        push_enabled: true,
        whatsapp_fallback: true,
        sms_fallback: true,
        email_enabled: false
      },
      safety: {
        incident_reporting: true,
        emergency_contacts: ['+250788000000'],
        background_checks: false, // Future feature
        real_time_monitoring: false // Future feature
      },
      rewards: {
        weekly_leaderboard: true,
        top_winners: 5,
        point_values: {
          passenger_referral: 1,
          driver_referral: 5
        },
        weekly_prizes: {
          '1st': '5000 RWF',
          '2nd': '3000 RWF',
          '3rd': '2000 RWF',
          '4th': '1000 RWF',
          '5th': '500 RWF'
        }
      },
      api: {
        rate_limits: {
          trip_creation: '10/hour',
          location_updates: '60/minute',
          search: '100/hour'
        },
        timeout: 30000, // ms
        retry_attempts: 3
      },
      maintenance: {
        scheduled_downtime: null,
        update_required: false,
        minimum_app_version: '1.0.0'
      }
    };

    // Add environment-specific overrides
    if (config.app.environment === 'development') {
      config.features.ai_suggestions = true;
      config.limits.max_daily_trips = 100;
      config.api.rate_limits = {
        trip_creation: '100/hour',
        location_updates: '1000/minute',
        search: '1000/hour'
      };
    }

    return new Response(JSON.stringify({
      success: true,
      config,
      timestamp: new Date().toISOString(),
      cache_duration: 300 // 5 minutes
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      },
    });

  } catch (error) {
    console.error('Error in get-app-config:', error);
    return new Response(JSON.stringify({
      error: 'Failed to fetch app configuration',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
