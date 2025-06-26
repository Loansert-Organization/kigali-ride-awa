
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, redirectUri } = await req.json();
    
    if (!code) {
      throw new Error('Authorization code is required');
    }

    const clientId = '378544894308-56vi69m88k8cc29b4fikf7g8a93fhoap.apps.googleusercontent.com';
    const clientSecret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
    
    if (!clientSecret) {
      throw new Error('Google OAuth client secret not configured');
    }

    console.log('🔐 Exchanging Google OAuth code for tokens...');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri || 'postmessage',
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('❌ Token exchange failed:', tokenData);
      throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
    }

    console.log('✅ Token exchange successful');

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      console.error('❌ Failed to get user info:', userData);
      throw new Error('Failed to get user information from Google');
    }

    console.log('✅ Google user info retrieved:', { id: userData.id, email: userData.email });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists or create new user profile
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .maybeSingle();

    if (userError && userError.code !== 'PGRST116') {
      console.error('❌ Error checking existing user:', userError);
      throw new Error('Database error while checking user');
    }

    let userProfile;
    
    if (existingUser) {
      console.log('✅ Existing user found:', existingUser.id);
      userProfile = existingUser;
    } else {
      console.log('👤 Creating new user profile...');
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          phone: userData.phone || null,
          auth_method: 'google',
          google_id: userData.id,
          role: null, // Will be set during onboarding
          onboarding_completed: false,
          location_enabled: false,
          notifications_enabled: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        throw new Error('Failed to create user profile');
      }

      console.log('✅ New user created:', newUser.id);
      userProfile = newUser;
    }

    return new Response(JSON.stringify({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        onboarding_completed: userProfile.onboarding_completed,
        google_data: {
          id: userData.id,
          name: userData.name,
          picture: userData.picture,
        }
      },
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Google OAuth error:', error);
    return new Response(JSON.stringify({
      error: 'Google OAuth failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
