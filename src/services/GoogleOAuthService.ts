
import { supabase } from '@/integrations/supabase/client';
import { googleOAuth } from '@/config/environment';

// Extend the Window interface to include Google API
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initCodeClient: (config: any) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

class GoogleOAuthService {
  private clientId = googleOAuth.clientId;

  constructor() {
    console.log('🔐 Initializing Google OAuth Service with Client ID:', this.clientId);
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

      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google OAuth API not available');
      }

      console.log('🔐 Starting Google OAuth flow with Client ID:', this.clientId);

      return new Promise((resolve) => {
        const client = window.google!.accounts.oauth2.initCodeClient({
          client_id: this.clientId,
          scope: 'email profile openid',
          ux_mode: 'popup',
          callback: async (response: any) => {
            console.log('📝 Google OAuth response received:', { 
              hasCode: !!response.code,
              hasError: !!response.error 
            });
            
            if (response.error) {
              console.error('❌ Google OAuth error:', response.error);
              resolve({ success: false, error: response.error });
              return;
            }

            try {
              console.log('📤 Sending authorization code to edge function...');
              
              // Send the authorization code to our edge function
              const { data, error } = await supabase.functions.invoke('google-oauth', {
                body: {
                  code: response.code,
                  redirectUri: window.location.origin
                }
              });

              console.log('📥 Edge function response:', { 
                hasData: !!data,
                hasError: !!error,
                success: data?.success 
              });

              if (error) {
                console.error('❌ OAuth processing error:', error);
                resolve({ success: false, error: error.message });
                return;
              }

              if (!data?.success) {
                console.error('❌ OAuth failed:', data?.error);
                resolve({ success: false, error: data?.error || 'OAuth processing failed' });
                return;
              }

              console.log('✅ Google OAuth successful');
              resolve({ success: true, user: data.user });

            } catch (error: any) {
              console.error('💥 OAuth processing exception:', error);
              resolve({ success: false, error: error.message });
            }
          },
        });

        console.log('🚀 Requesting authorization code...');
        client.requestCode();
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
