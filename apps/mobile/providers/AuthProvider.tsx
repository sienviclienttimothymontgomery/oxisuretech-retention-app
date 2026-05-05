import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  onboardingCompleted: boolean | null;
  setOnboardingCompleted: (val: boolean | null) => void;
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
  onboardingCompleted: null,
  setOnboardingCompleted: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function useProtectedRoute(user: User | null, loading: boolean, isAdmin: boolean, onboardingCompleted: boolean | null) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const path = location.pathname;
    const inAuthGroup = path.includes('(auth)');
    const inAdminRoute = path.includes('(app)/admin');
    const inOnboardingGroup = path.includes('(onboarding)');

    if (!user) {
      if (!inAuthGroup) {
        // Redirect to login if not authenticated and not already on an auth screen
        navigate('/(auth)/login', { replace: true });
      }
      return;
    }

    if (isAdmin) {
      if (!inAdminRoute) {
        // Admin users always go to admin dashboard
        navigate('/(app)/admin', { replace: true });
      }
      return;
    }

    // Wait until we know the onboarding status before navigating regular users
    if (onboardingCompleted === null) return;

    if (onboardingCompleted) {
      // Regular user, onboarding completed -> restrict from auth, onboarding, or root
      if (inAuthGroup || inOnboardingGroup || path === '/') {
        navigate('/(app)/dashboard', { replace: true });
      }
    } else {
      // Regular user, onboarding not completed -> restrict to onboarding group
      if (!inOnboardingGroup) {
        navigate('/(onboarding)/welcome', { replace: true });
      }
    }
  }, [user, location.pathname, loading, isAdmin, onboardingCompleted, navigate]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const handleSetOnboardingCompleted = useCallback((val: boolean | null) => {
    setOnboardingCompleted(val);
    if (session?.user?.id && val !== null) {
      try {
        localStorage.setItem(`onboarding_completed_${session.user.id}`, String(val));
      } catch (e) {
        console.error('localStorage error', e);
      }
    }
  }, [session?.user?.id]);

  // Track whether we've already processed an OAuth URL in this session
  const oauthProcessedRef = useRef(false);

  // Admin emails - add more as needed
  const ADMIN_EMAILS = ['admin@oxisuretech.com'];

  const checkAdminStatus = (userEmail: string | undefined): boolean => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail.toLowerCase());
  };

  const navigateAfterAuth = useCallback(async (newSession: Session | null) => {
    if (!newSession?.user) return;
    
    // Explicitly update React session state so the route guard doesn't kick us out!
    setSession(newSession);
    
    const admin = checkAdminStatus(newSession.user.email);
    setIsAdmin(admin);
    
    if (admin) {
      navigate('/(app)/admin', { replace: true });
    } else {
      let localCompletedStr = 'false';
      try {
        localCompletedStr = localStorage.getItem(`onboarding_completed_${newSession.user.id}`) || 'false';
      } catch(e) {}
      
      try {
        const profilePromise = supabase.from('profiles').select('onboarding_completed').eq('id', newSession.user.id).single();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000));
        const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;
        const hasCompleted = profile?.onboarding_completed || localCompletedStr === 'true';
        handleSetOnboardingCompleted(hasCompleted);
        navigate(hasCompleted ? '/(app)/dashboard' : '/(onboarding)/welcome', { replace: true });
      } catch (e) {
        console.warn('OAuth profile fetch timed out or failed, relying on local state');
        const hasCompleted = localCompletedStr === 'true';
        handleSetOnboardingCompleted(hasCompleted);
        navigate(hasCompleted ? '/(app)/dashboard' : '/(onboarding)/welcome', { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    // Configure Google Sign-In (no-op for browser-based flow, kept for API consistency)
    configureGoogleSignIn();

    // Failsafe timeout: if Supabase hangs (e.g. stuck refresh token network request), 
    // manually rescue the session from localStorage so the user isn't forced to log in again.
    const timeoutId = setTimeout(() => {
      console.warn('Supabase getSession timed out. Attempting manual session recovery.');
      try {
        const tokenStr = localStorage.getItem('sb-ytqnbvkordtflrvibmss-auth-token');
        if (tokenStr) {
          const parsed = JSON.parse(tokenStr);
          if (parsed && parsed.user) {
            setSession({ user: parsed.user } as any);
            setIsAdmin(checkAdminStatus(parsed.user.email));
            
            const localCompletedStr = localStorage.getItem(`onboarding_completed_${parsed.user.id}`);
            setOnboardingCompleted(localCompletedStr === 'true');
          } else {
            setOnboardingCompleted(false);
          }
        } else {
          setOnboardingCompleted(false);
        }
      } catch (e) {
        console.error('Manual session recovery failed', e);
        setOnboardingCompleted(false);
      } finally {
        setLoading(false);
      }
    }, 8000);

    // We need both getSession and onAuthStateChange to cover all edge cases, 
    // but we use a flag to guarantee the initial boot sequence only runs once!
    let sessionHandled = false;

    const handleSession = async (session: Session | null) => {
      if (!mounted) return;
      clearTimeout(timeoutId);
      
      setSession(session);
      if (session?.user) {
        setIsAdmin(checkAdminStatus(session.user.email));
        let localCompletedStr = 'false';
        try {
          localCompletedStr = localStorage.getItem(`onboarding_completed_${session.user.id}`) || 'false';
        } catch(e) {}
        
        try {
          const profilePromise = supabase.from('profiles').select('onboarding_completed').eq('id', session.user.id).single();
          const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000));
          const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;
          const hasCompleted = profile?.onboarding_completed || localCompletedStr === 'true';
          if (mounted) setOnboardingCompleted(hasCompleted);
        } catch (e) {
          console.warn('Profile fetch timed out or failed, relying on local state');
          if (mounted) setOnboardingCompleted(localCompletedStr === 'true');
        }
      } else {
        setIsAdmin(false);
        if (mounted) setOnboardingCompleted(null);
      }
      
      if (mounted) setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!sessionHandled) {
        sessionHandled = true;
        handleSession(session);
      }
    }).catch(err => {
      console.warn('getSession failed', err);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthProvider] Auth state changed:', _event, session ? 'HAS_SESSION' : 'NO_SESSION');
      
      if (_event === 'INITIAL_SESSION') {
        if (!sessionHandled) {
          sessionHandled = true;
          handleSession(session);
        }
      } else {
        // Subsequent login/logout events
        handleSession(session);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Handle deep-link OAuth callbacks
  useEffect(() => {
    const processOAuthUrl = async (url: string) => {
      if (!url) return;
      if (oauthProcessedRef.current) {
        console.log('[AuthProvider] OAuth already processed, skipping duplicate.');
        return;
      }

      console.log('[AuthProvider] Raw URL received:', url);

      // Check if it's our login callback
      if (!url.startsWith('com.anonymous.oxisuretechmobile://login-callback')) {
        console.log('[AuthProvider] Not a login-callback URL, ignoring.');
        return;
      }

      oauthProcessedRef.current = true;

      try {
        // Close the browser immediately so the user sees the app
        try {
          await Browser.close();
          console.log('[AuthProvider] Browser closed successfully.');
        } catch (_) {
          console.log('[AuthProvider] Browser.close() failed (may already be closed).');
        }

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
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || '',
          });
          if (error) {
            console.error('[AuthProvider] setSession failed:', error.message);
          } else {
            console.log('[AuthProvider] Session established successfully!');
            navigateAfterAuth(data.session);
          }
          return;
        }

        // 2. Exchange PKCE code for session
        if (code) {
          console.log('[AuthProvider] Exchanging PKCE code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && data.session) {
            console.log('[AuthProvider] Code exchange successful!');
            navigateAfterAuth(data.session);
            return;
          }

          // PKCE exchange failed — likely code_verifier was lost.
          // Fallback: call the Supabase token endpoint directly.
          console.warn('[AuthProvider] PKCE exchange failed:', error?.message);
          console.log('[AuthProvider] Trying direct token endpoint fallback...');

          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const resp = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
              },
              body: JSON.stringify({
                auth_code: code,
                code_verifier: '', // empty — server may accept if PKCE is not strictly enforced
              }),
            });

            if (resp.ok) {
              const tokenData = await resp.json();
              if (tokenData.access_token) {
                console.log('[AuthProvider] Direct token fetch succeeded!');
                const { data: sessionData, error: sessErr } = await supabase.auth.setSession({
                  access_token: tokenData.access_token,
                  refresh_token: tokenData.refresh_token || '',
                });
                if (!sessErr && sessionData.session) {
                  navigateAfterAuth(sessionData.session);
                  return;
                }
              }
            }
            console.warn('[AuthProvider] Direct token fallback also failed. Status:', resp.status);
          } catch (fetchErr) {
            console.error('[AuthProvider] Direct token fetch error:', fetchErr);
          }

          // Last resort — check if session somehow exists
          const { data: lastResort } = await supabase.auth.getSession();
          if (lastResort.session) {
            console.log('[AuthProvider] Found session via getSession fallback!');
            navigateAfterAuth(lastResort.session);
          }
          return;
        }

        console.warn('[AuthProvider] No tokens or code found in callback URL!');
        console.warn('[AuthProvider] Full URL was:', url);

        // 3. Last-resort fallback: check if Supabase somehow already picked up the session
        console.log('[AuthProvider] Attempting fallback session check...');
        const { data: fallbackData } = await supabase.auth.getSession();
        if (fallbackData.session) {
          console.log('[AuthProvider] Fallback session found!');
          navigateAfterAuth(fallbackData.session);
        }
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
    const appUrlListener = App.addListener('appUrlOpen', (event) => {
      console.log('[AuthProvider] appUrlOpen event fired:', event.url);
      processOAuthUrl(event.url);
    });

    // 3. Listen for browser close — if user completed OAuth and the browser
    //    is closing, but the deep-link didn't fire (e.g., some Android OEMs),
    //    we do a fallback session check.
    const browserFinishedListener = Browser.addListener('browserFinished', () => {
      console.log('[AuthProvider] Browser finished event. Checking for session...');
      // Give 800ms for the deep-link to potentially fire first
      setTimeout(async () => {
        if (oauthProcessedRef.current) {
          console.log('[AuthProvider] OAuth already handled via deep link, skipping browser fallback.');
          return;
        }
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('[AuthProvider] Session found after browser close (fallback)!');
            oauthProcessedRef.current = true;
            setSession(data.session);
            setIsAdmin(checkAdminStatus(data.session.user.email));
            navigateAfterAuth(data.session);
          } else {
            console.log('[AuthProvider] No session after browser close. User may have cancelled.');
          }
        } catch (err) {
          console.error('[AuthProvider] Error checking session after browser close:', err);
        }
      }, 800);
    });

    return () => {
      appUrlListener.then(l => l.remove());
      browserFinishedListener.then(l => l.remove());
    };
  }, [navigate, navigateAfterAuth]);

  useProtectedRoute(session?.user ?? null, loading, isAdmin, onboardingCompleted);

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    // Fallback: manually force state update immediately if auth succeeds, 
    // in case onAuthStateChange listener drops the event on WebViews
    if (!error && data?.session) {
      setSession(data.session);
      setIsAdmin(checkAdminStatus(data.session.user.email));
      
      let localCompletedStr = 'false';
      try {
        localCompletedStr = localStorage.getItem(`onboarding_completed_${data.session.user.id}`) || 'false';
      } catch(e) {}
      
      try {
        const profilePromise = supabase.from('profiles').select('onboarding_completed').eq('id', data.session.user.id).single();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000));
        const { data: profile } = await Promise.race([profilePromise, timeoutPromise]) as any;
        const hasCompleted = profile?.onboarding_completed || localCompletedStr === 'true';
        setOnboardingCompleted(hasCompleted);
      } catch (e) {
        setOnboardingCompleted(localCompletedStr === 'true');
      }
    }
    
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const emailRedirectTo = 'com.anonymous.oxisuretechmobile://login-callback';
    console.log('[Auth] Email redirect URI:', emailRedirectTo);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo,
      },
    });
    
    if (!error && data?.session) {
      setSession(data.session);
      setIsAdmin(checkAdminStatus(data.session.user.email));
      setOnboardingCompleted(false); // New signups always need onboarding
    }
    
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    // Reset the processed flag so a new OAuth flow can be handled
    oauthProcessedRef.current = false;
    const { error } = await googleSignIn();
    return { error: error as Error | null };
  };

  const signOut = async () => {
    oauthProcessedRef.current = false;
    
    // Clear React state synchronously so the UI logs out instantly, avoiding network hangs
    setSession(null);
    setOnboardingCompleted(null);
    setIsAdmin(false);
    
    try {
      // Force local signout so Supabase completely forgets the session locally.
      // This ensures subsequent logins actually trigger state changes.
      await supabase.auth.signOut({ scope: 'local' });
      // Fire and forget the global signout to revoke the token on the server
      supabase.auth.signOut().catch(() => {});
    } catch (err) {
      console.warn('SignOut network request hung or failed:', err);
    }
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
        onboardingCompleted,
        setOnboardingCompleted: handleSetOnboardingCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
