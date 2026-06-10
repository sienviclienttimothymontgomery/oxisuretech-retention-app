"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { logEvent } from "@/utils/analytics";

export default function VerifyHashClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState("Verifying your secure link...");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    let isMounted = true;

    const processAuth = async () => {
      try {
        const hash = window.location.hash;
        const hashParams = new URLSearchParams(hash.substring(1));

        // Check for errors in the hash fragment
        if (hashParams.has("error_description")) {
          const desc = hashParams.get("error_description") || "Unknown error";
          console.error("Auth hash error:", desc);
          if (isMounted) router.push('/auth/auth-code-error');
          return;
        }

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        // If the URL hash contains tokens, sign out any existing session first,
        // then set the new session from the magic link tokens.
        if (accessToken && refreshToken) {
          if (isMounted) setStatus("Signing you in...");

          // Set the session from the magic link tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("setSession error:", error.message);
            if (isMounted) router.push('/auth/auth-code-error');
            return;
          }

          if (data.session) {
            if (isMounted) setStatus("Verification successful! Redirecting...");
            await logEvent("login", data.session.user.id);
            const next = searchParams.get('next') || '/web/dashboard';
            setTimeout(() => {
              if (isMounted) window.location.href = next;
            }, 500);
            return;
          }
        }

        // No tokens in hash — maybe we landed here from a callback redirect.
        // Check for an existing valid session.
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) setStatus("Already signed in. Redirecting...");
          const next = searchParams.get('next') || '/web/dashboard';
          setTimeout(() => {
            if (isMounted) window.location.href = next;
          }, 500);
          return;
        }

        // No tokens, no session — wait for auth listener up to 10 seconds
        const timeout = setTimeout(() => {
          if (isMounted) {
            setStatus("Link expired or invalid. Redirecting...");
            setTimeout(() => {
              if (isMounted) router.push('/auth/auth-code-error');
            }, 1500);
          }
        }, 10000);

        const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
          if (event === 'SIGNED_IN' && session) {
            clearTimeout(timeout);
            if (isMounted) setStatus("Verification successful! Redirecting...");
            const next = searchParams.get('next') || '/web/dashboard';
            logEvent("login", session.user.id).finally(() => {
              window.location.href = next;
            });
          }
        });

        // Cleanup listener on unmount
        return () => {
          clearTimeout(timeout);
          authListener.subscription.unsubscribe();
        };

      } catch (err) {
        console.error("Hash verification error:", err);
        if (isMounted) router.push('/auth/auth-code-error');
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-up">
      <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
      <h1 className="text-xl font-semibold text-[var(--color-text)]">
        {status}
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        Please wait a moment while we securely log you in.
      </p>
    </div>
  );
}
