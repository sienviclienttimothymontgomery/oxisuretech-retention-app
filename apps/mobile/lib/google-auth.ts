import { Browser } from '@capacitor/browser';
import { supabase } from './supabase';

export function configureGoogleSignIn() {
  // No-op for Capacitor. Browser handling is automatic.
}

/**
 * Open the Google OAuth flow in the system browser.
 *
 * Uses PKCE flow (default). After authentication, Supabase redirects to
 * our custom scheme with a `code` parameter in the query string:
 *   com.anonymous.oxisuretechmobile://login-callback?code=xxx
 *
 * Query string params are reliably handled by Chrome for custom scheme
 * redirects, unlike hash fragments (#access_token=...) which Chrome
 * often blocks on Android.
 */
export async function signInWithGoogle() {
  try {
    const redirectTo = 'com.anonymous.oxisuretechmobile://login-callback';

    console.log('[Google Auth] Redirect URI:', redirectTo);

    // Use default PKCE flow — Supabase will redirect with ?code=xxx
    // in the query string, which Android handles reliably.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: {
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

    console.log('[Google Auth] Opening browser with OAuth URL...');

    await Browser.open({
      url: data.url,
      presentationStyle: 'popover',
    });

    return { data: null, error: null };

  } catch (err) {
    console.error('[Google Auth] Error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('An unknown error occurred during Google Sign-In.'),
    };
  }
}
