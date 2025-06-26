
import { supabase } from '@/integrations/supabase/client';
import { googleOAuth } from '@/config/environment';

class GoogleOAuthService {
  private clientId = googleOAuth.clientId;

  constructor() {
    console.log('🔐 Initializing Google OAuth Service');
    this.loadGoogleAPI();
  }

  private async loadGoogleAPI(): Promise<void> {
    if (window.google?.accounts) {
      console.log('✅ Google API already loaded');
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google API loaded successfully');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('❌ Failed to load Google API:', error);
        reject(new Error('Failed to load Google API'));
      };
      
      document.head.appendChild(script);
    });
  }

  async signInWithGoogle(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      await this.loadGoogleAPI();

      console.log('🔐 Starting Google OAuth flow...');

      return new Promise((resolve) => {
        window.google.accounts.oauth2.initCodeClient({
          client_id: this.clientId,
          scope: 'email profile openid',
          ux_mode: 'popup',
          callback: async (response) => {
            console.log('📝 Google OAuth response received');
            
            if (response.error) {
              console.error('❌ Google OAuth error:', response.error);
              resolve({ success: false, error: response.error });
              return;
            }

            try {
              // Send the authorization code to our edge function
              const { data, error } = await supabase.functions.invoke('google-oauth', {
                body: {
                  code: response.code,
                  redirectUri: window.location.origin
                }
              });

              if (error) {
                console.error('❌ OAuth processing error:', error);
                resolve({ success: false, error: error.message });
                return;
              }

              if (!data.success) {
                console.error('❌ OAuth failed:', data.error);
                resolve({ success: false, error: data.error });
                return;
              }

              console.log('✅ Google OAuth successful:', data.user);
              resolve({ success: true, user: data.user });

            } catch (error: any) {
              console.error('💥 OAuth processing exception:', error);
              resolve({ success: false, error: error.message });
            }
          },
        }).requestCode();
      });

    } catch (error: any) {
      console.error('💥 Google sign-in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut(): Promise<void> {
    try {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      console.log('✅ Google sign-out completed');
    } catch (error) {
      console.error('❌ Google sign-out error:', error);
    }
  }
}

export const googleOAuthService = new GoogleOAuthService();
