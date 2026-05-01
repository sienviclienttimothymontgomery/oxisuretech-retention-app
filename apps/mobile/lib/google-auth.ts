import { Browser } from '@capacitor/browser';
import { supabase } from './supabase';

export function configureGoogleSignIn() {
  // No-op for Capacitor. Browser handling is automatic.
}

export async function signInWithGoogle() {
  try {
    const redirectTo = 'com.anonymous.oxisuretechmobile://login-callback';

    console.log('[Google Auth] Redirect URI:', redirectTo);

    // 1. Get the OAuth URL from Supabase
    // Force implicit flow so tokens come back in the URL hash directly.
    // PKCE flow breaks in Capacitor because the code_verifier is stored in the
    // WebView storage and can be lost when Android kills the app while the
    // external browser is open.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // We handle the browser ourselves
        queryParams: {
          response_type: 'token',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      return { data: null, error };
    }

    if (!data?.url) {
      return { data: null, error: new Error('No OAuth URL received from Supabase.') };
    }

    // 2. Open the system browser
    await Browser.open({ url: data.url });

    // In Capacitor, the deep link listener in AuthProvider will handle the redirect,
    // parse the tokens, and establish the session. We don't wait for it here.
    return { data: null, error: null }; // Returning null data implies "redirecting..."

  } catch (err) {
    console.error('[Google Auth] Error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('An unknown error occurred during Google Sign-In.'),
    };
  }
}
