"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { logEvent } from "@/utils/analytics";

export default function CallbackClient() {
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
        // Resolve domain mismatch (Firebase App Hosting hosted.app -> web.app custom domain)
        if (typeof window !== "undefined" && window.location.hostname.endsWith(".hosted.app")) {
          console.log("[Auth Callback] Mismatch domain detected. Redirecting to production domain...");
          const targetUrl = new URL(window.location.href);
          targetUrl.hostname = "oxisuretech-retention-app.web.app";
          window.location.href = targetUrl.toString();
          return;
        }

        const next = searchParams.get("next") || "/";
        const code = searchParams.get("code");

        if (code) {
          // Manually restore the code verifier cookie from sessionStorage/localStorage
          if (typeof window !== "undefined") {
            let verifierValue = "";
            let foundKey = "";
            for (let i = 0; i < window.sessionStorage.length; i++) {
              const k = window.sessionStorage.key(i);
              if (k && k.endsWith("-code-verifier")) {
                verifierValue = window.sessionStorage.getItem(k) || "";
                foundKey = k;
                break;
              }
            }
            if (!verifierValue) {
              for (let i = 0; i < window.localStorage.length; i++) {
                const k = window.localStorage.key(i);
                if (k && k.endsWith("-code-verifier")) {
                  verifierValue = window.localStorage.getItem(k) || "";
                  foundKey = k;
                  break;
                }
              }
            }

            if (verifierValue) {
              console.log(`[Auth Callback] Restoring code verifier cookie for key "${foundKey}":`, verifierValue.substring(0, 10) + "...");
              const secureFlag = window.location.protocol === "https:" ? "; Secure" : "";
              
              // Write to both __session-code-verifier and the default sb-[ref]-auth-token-code-verifier names
              document.cookie = `__session-code-verifier=${encodeURIComponent(verifierValue)}; path=/; SameSite=Lax${secureFlag}`;
              
              // We also set the raw project-ref prefixed key in case the SDK queries for that
              const projectRef = foundKey.replace("-code-verifier", "").replace("-auth-token", "");
              if (projectRef && projectRef !== foundKey) {
                document.cookie = `${projectRef}-code-verifier=${encodeURIComponent(verifierValue)}; path=/; SameSite=Lax${secureFlag}`;
              }
            } else {
              console.warn("[Auth Callback] No code verifier found in sessionStorage or localStorage");
            }
          }
        }

        if (code) {
          const getVerifiersLog = () => {
            if (typeof window === "undefined") return {};
            const items: Record<string, string> = {};
            for (let i = 0; i < window.sessionStorage.length; i++) {
              const k = window.sessionStorage.key(i);
              if (k && k.endsWith("-code-verifier")) {
                items[`sessionStorage:${k}`] = window.sessionStorage.getItem(k) || "";
              }
            }
            for (let i = 0; i < window.localStorage.length; i++) {
              const k = window.localStorage.key(i);
              if (k && k.endsWith("-code-verifier")) {
                items[`localStorage:${k}`] = window.localStorage.getItem(k) || "";
              }
            }
            return items;
          };
          console.log("[Auth Callback] Initiating PKCE exchange with details:", {
            code: code.substring(0, 10) + "...",
            documentCookies: typeof document !== "undefined" ? document.cookie : "N/A",
            verifiersInStorage: getVerifiersLog(),
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
            await new Promise((r) => setTimeout(r, 300));
            window.location.href = next;
            return;
          }
        }

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

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) setStatus("Already signed in. Redirecting...");
          await new Promise((r) => setTimeout(r, 300));
          window.location.href = searchParams.get("next") || "/";
          return;
        }

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
