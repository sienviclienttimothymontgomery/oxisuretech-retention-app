"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { logEvent } from "@/utils/analytics";

/**
 * Client-side OAuth callback handler.
 *
 * Why client-side instead of a server-side Route Handler?
 * -------------------------------------------------------
 * Firebase Hosting only forwards cookies named exactly `__session` to
 * Cloud Run.  When Supabase SSR initiates a PKCE OAuth flow, it stores
 * the code verifier in a cookie named `__session-code-verifier`.
 * Firebase Hosting strips this cookie before the request reaches the
 * server, so `exchangeCodeForSession` fails on the server because it
 * cannot find the verifier.
 *
 * By handling the exchange on the client side, the browser has direct
 * access to `document.cookie` and can read the code verifier cookie
 * without Firebase Hosting interfering.
 */
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState("Completing sign-in...");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    let isMounted = true;

    const processCallback = async () => {
      try {
        const next = searchParams.get("next") || "/";

        // 1. Check for a PKCE code in the query string (?code=xxx)
        const code = searchParams.get("code");

        if (code) {
          console.log("[Auth Callback] Initiating PKCE exchange with details:", {
            code: code.substring(0, 10) + "...",
            documentCookies: typeof document !== "undefined" ? document.cookie : "N/A",
            sessionStorageVerifier: typeof window !== "undefined" ? window.sessionStorage.getItem("__session-code-verifier") : "N/A",
            localStorageVerifier: typeof window !== "undefined" ? window.localStorage.getItem("__session-code-verifier") : "N/A",
          });
          if (isMounted) setStatus("Exchanging authorization code...");

          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("[Auth Callback] Code exchange failed:", error.message);
            router.push(`/auth/auth-code-error?error=code_exchange_failed&description=${encodeURIComponent(error.message)}`);
            return;
          }

          if (data.session) {
            if (isMounted) setStatus("Sign-in successful! Redirecting...");
            await logEvent("login", data.session.user.id);
            // Small delay to allow cookies to propagate
            await new Promise((r) => setTimeout(r, 300));
            window.location.href = next;
            return;
          }
        }

        // 2. Check for tokens in the hash fragment (#access_token=xxx&refresh_token=yyy)
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));

          if (hashParams.has("error_description")) {
            const desc = hashParams.get("error_description") || "Unknown error";
            console.error("[Auth Callback] Hash error:", desc);
            router.push("/auth/auth-code-error");
            return;
          }

          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            if (isMounted) setStatus("Setting up your session...");
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error("[Auth Callback] setSession failed:", error.message);
              router.push(`/auth/auth-code-error?error=setsession_failed&description=${encodeURIComponent(error.message)}`);
              return;
            }

            if (data.session) {
              if (isMounted) setStatus("Sign-in successful! Redirecting...");
              await logEvent("login", data.session.user.id);
              await new Promise((r) => setTimeout(r, 300));
              window.location.href = next;
              return;
            }
          }
        }

        // 3. Fallback: check for an existing session (e.g. auto-detected by onAuthStateChange)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) setStatus("Already signed in. Redirecting...");
          await new Promise((r) => setTimeout(r, 300));
          window.location.href = searchParams.get("next") || "/";
          return;
        }

        // 4. Wait briefly for auth state change as a last resort
        const timeout = setTimeout(() => {
          if (isMounted) {
            setStatus("Something went wrong. Redirecting...");
            setTimeout(() => {
              router.push("/auth/auth-code-error");
            }, 1500);
          }
        }, 8000);

        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event: any, session: any) => {
            if (event === "SIGNED_IN" && session) {
              clearTimeout(timeout);
              if (isMounted) {
                setStatus("Sign-in successful! Redirecting...");
              }
              logEvent("login", session.user.id).finally(() => {
                window.location.href = searchParams.get("next") || "/";
              });
            }
          }
        );

        return () => {
          clearTimeout(timeout);
          authListener.subscription.unsubscribe();
        };
      } catch (err) {
        console.error("[Auth Callback] Fatal error:", err);
        router.push("/auth/auth-code-error");
      }
    };

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-up">
      <Loader2 size={40} className="animate-spin text-[#0EA5E9]" />
      <h1 className="text-xl font-semibold text-[#0F172A]">{status}</h1>
      <p className="text-sm text-[#64748B]">
        Please wait a moment while we securely log you in.
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <header className="flex items-center justify-center py-2 mb-8">
        <Image
          src="/logo.png"
          alt="OxiSure Tech"
          width={320}
          height={96}
          className="h-24 w-auto"
        />
      </header>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 size={40} className="animate-spin text-[#0EA5E9]" />
            <h1 className="text-xl font-semibold text-[#0F172A]">Loading...</h1>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
