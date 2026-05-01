import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { configureGoogleSignIn, signInWithGoogle as googleSignIn } from '@/lib/google-auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function useProtectedRoute(user: User | null, loading: boolean, isAdmin: boolean) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    const inAuthGroup = path.includes('(auth)');
    const inAppGroup = path.includes('(app)') || path.includes('(onboarding)');
    const inAdminRoute = path.includes('(app)/admin');

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not already on an auth screen
      navigate('/(auth)/login', { replace: true });
    } else if (user && isAdmin && !inAdminRoute) {
      // Admin users always go to admin dashboard
      navigate('/(app)/admin', { replace: true });
    } else if (user && !isAdmin && inAuthGroup) {
      // Redirect to onboarding or dashboard if user is authenticated but on auth screen
      navigate('/(onboarding)/welcome', { replace: true });
    } else if (user && !isAdmin && !inAppGroup) {
      // Authenticated user on root "/" or unknown route → send to welcome
      navigate('/(onboarding)/welcome', { replace: true });
    }
  }, [user, location.pathname, loading, isAdmin, navigate]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Admin emails - add more as needed
  const ADMIN_EMAILS = ['admin@oxisuretech.com'];

  const checkAdminStatus = (userEmail: string | undefined): boolean => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail.toLowerCase());
  };

  useEffect(() => {
    // Configure Google Sign-In (no-op for browser-based flow, kept for API consistency)
    configureGoogleSignIn();

    // Get initial session and check admin status
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setIsAdmin(checkAdminStatus(session.user.email));
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setIsAdmin(checkAdminStatus(session.user.email));
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle deep-link OAuth callbacks
  useEffect(() => {
    const processOAuthUrl = async (url: string) => {
      if (!url) return;

      console.log('[AuthProvider] Raw URL received:', url);

      // Check if it's our login callback
      if (!url.startsWith('com.anonymous.oxisuretechmobile://login-callback')) {
        console.log('[AuthProvider] Not a login-callback URL, ignoring.');
        return;
      }

      try {
        // Close the browser immediately so the user sees the app
        try { await Browser.close(); } catch (_) { /* may already be closed */ }

        // Extract tokens directly from the raw URL string.
        // We avoid new URL() with custom schemes as it can be unreliable.
        let access_token: string | null = null;
        let refresh_token: string | null = null;
        let code: string | null = null;

        // Check for hash fragment: ...#access_token=xxx&refresh_token=yyy
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const fragment = url.substring(hashIndex + 1);
          console.log('[AuthProvider] Hash fragment found:', fragment.substring(0, 80) + '...');
          const hashParams = new URLSearchParams(fragment);
          access_token = hashParams.get('access_token');
          refresh_token = hashParams.get('refresh_token');
        }

        // Check for query params: ...?access_token=xxx or ...?code=xxx
        if (!access_token) {
          const qIndex = url.indexOf('?');
          if (qIndex !== -1) {
            // Get query string (strip hash if present after query)
            const queryEnd = hashIndex > qIndex ? hashIndex : url.length;
            const queryString = url.substring(qIndex + 1, queryEnd);
            console.log('[AuthProvider] Query params found:', queryString.substring(0, 80) + '...');
            const queryParams = new URLSearchParams(queryString);
            access_token = queryParams.get('access_token');
            refresh_token = queryParams.get('refresh_token');
            code = queryParams.get('code');
          }
        }

        console.log('[AuthProvider] Extracted → access_token:', access_token ? 'YES' : 'NO',
          '| refresh_token:', refresh_token ? 'YES' : 'NO',
          '| code:', code ? 'YES' : 'NO');

        // 1. Set session directly from tokens (implicit flow)
        if (access_token) {
          console.log('[AuthProvider] Setting session from tokens...');
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });
          if (error) {
            console.error('[AuthProvider] setSession failed:', error.message);
          } else {
            console.log('[AuthProvider] Session established successfully!');
            navigate('/(onboarding)/welcome', { replace: true });
          }
          return;
        }

        // 2. Exchange PKCE code for session (fallback)
        if (code) {
          console.log('[AuthProvider] Exchanging PKCE code for session...');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('[AuthProvider] Code exchange failed:', error.message);
          } else {
            console.log('[AuthProvider] Code exchange successful!');
            navigate('/(onboarding)/welcome', { replace: true });
          }
          return;
        }

        console.warn('[AuthProvider] No tokens or code found in callback URL!');
        console.warn('[AuthProvider] Full URL was:', url);
      } catch (e) {
        console.error('[AuthProvider] Fatal error processing OAuth URL:', e);
      }
    };

    // 1. Check if the app was LAUNCHED by a deep link (cold start)
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        console.log('[AuthProvider] App cold-started with URL:', result.url);
        processOAuthUrl(result.url);
      }
    });

    // 2. Listen for deep links while the app is already running (warm start)
    const listener = App.addListener('appUrlOpen', (event) => {
      console.log('[AuthProvider] appUrlOpen event fired:', event.url);
      processOAuthUrl(event.url);
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [navigate]);

  useProtectedRoute(session?.user ?? null, loading, isAdmin);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const emailRedirectTo = 'com.anonymous.oxisuretechmobile://login-callback';
    console.log('[Auth] Email redirect URI:', emailRedirectTo);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await googleSignIn();
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isAdmin,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
