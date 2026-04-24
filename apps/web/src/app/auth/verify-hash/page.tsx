"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";

function VerifyHashContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState("Verifying your secure link...");

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      try {
        // The @supabase/ssr createBrowserClient automatically parses the #access_token
        // from the URL hash, establishes the session, and sets the browser cookies.
        // We just need to check if the session exists.
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
          if (isMounted) setStatus("Verification successful! Redirecting...");
          // Grab the intended destination
          const next = searchParams.get('next') || '/web/dashboard';
          // Small delay to ensure cookies are fully committed
          setTimeout(() => {
            if (isMounted) router.push(next);
          }, 500);
        } else {
          // If no session is found, check if there's an error in the hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          if (hashParams.has("error_description")) {
            if (isMounted) router.push('/auth/auth-code-error');
          } else {
            // It might take a split second for the listener to fire
          }
        }
      } catch (err) {
        console.error("Hash verification error:", err);
        if (isMounted) router.push('/auth/auth-code-error');
      }
    };

    processAuth();

    // Fallback listener in case getSession fires before the hash is fully parsed
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (isMounted) setStatus("Verification successful! Redirecting...");
        const next = searchParams.get('next') || '/web/dashboard';
        router.push(next);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
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

export default function VerifyHashPage() {
  return (
    <div className="page-container justify-center pb-8 items-center text-center">
      <header className="flex items-center justify-center py-2 mb-8">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
      </header>
      
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4 animate-fade-up">
          <Loader2 size={40} className="animate-spin text-[var(--color-primary)]" />
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Loading...
          </h1>
        </div>
      }>
        <VerifyHashContent />
      </Suspense>
    </div>
  );
}
