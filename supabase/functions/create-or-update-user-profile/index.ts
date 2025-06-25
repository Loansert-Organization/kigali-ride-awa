
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const { profileData } = await req.json();
    
    // Validate required fields
    if (!profileData.role || !['passenger', 'driver'].includes(profileData.role)) {
      throw new Error('Invalid role specified');
    }

    // Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    let result;
    
    if (existingProfile) {
      // Update existing profile
      const updateData = {
        role: profileData.role,
        language: profileData.language || existingProfile.language,
        location_enabled: profileData.location_enabled ?? existingProfile.location_enabled,
        notifications_enabled: profileData.notifications_enabled ?? existingProfile.notifications_enabled,
        onboarding_completed: profileData.onboarding_completed ?? existingProfile.onboarding_completed,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile
      const insertData = {
        auth_user_id: user.id,
        role: profileData.role,
        language: profileData.language || 'en',
        location_enabled: profileData.location_enabled || false,
        notifications_enabled: profileData.notifications_enabled || false,
        referred_by: profileData.referred_by || null,
        onboarding_completed: profileData.onboarding_completed || false
      };

      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    // Handle driver-specific profile creation
    if (profileData.role === 'driver' && profileData.vehicleData) {
      const { data: existingDriverProfile } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', result.id)
        .single();

      const driverData = {
        user_id: result.id,
        vehicle_type: profileData.vehicleData.vehicle_type,
        plate_number: profileData.vehicleData.plate_number,
        preferred_zone: profileData.vehicleData.preferred_zone || null,
        is_online: false
      };

      if (existingDriverProfile) {
        await supabase
          .from('driver_profiles')
          .update(driverData)
          .eq('user_id', result.id);
      } else {
        await supabase
          .from('driver_profiles')
          .insert(driverData);
      }
    }

    console.log('Profile updated successfully:', result);

    return new Response(JSON.stringify({
      success: true,
      profile: result,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-or-update-user-profile:', error);
    return new Response(JSON.stringify({
      error: 'Profile operation failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
