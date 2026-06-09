'use client'

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "link_expired";
  const description = searchParams.get("description") || "The link you clicked is no longer valid. It may have expired or already been used.";

  const getErrorTitle = () => {
    switch (error) {
      case "code_exchange_failed":
        return "Authentication Code Exchange Failed";
      case "setsession_failed":
        return "Failed to Establish Session";
      default:
        return "Link Expired or Invalid";
    }
  };

  return (
    <Card bordered className="mb-6 p-6 animate-fade-up">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center">
          <AlertCircle size={24} className="text-[var(--color-danger)]" />
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            {getErrorTitle()}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
          {description.toLowerCase().includes("pkce") && (
            <div className="text-left bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 text-xs text-[#1E40AF] space-y-2 mt-4 max-w-md mx-auto">
              <p className="font-semibold text-[#1E3A8A]">💡 Troubleshooting Domain Mismatch:</p>
              <p>This error is almost always caused by a <strong>domain mismatch</strong> during authentication:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>You may have initiated login on <code>localhost:3000</code> or <code>web.app</code>, but were redirected back to the internal <code>us-east4.hosted.app</code> domain (or vice-versa).</li>
                <li>Cookies and local storage cannot be shared across different domains, causing this security check to fail.</li>
              </ul>
              <p className="font-semibold text-[#1E3A8A] mt-2">How to Fix:</p>
              <p>Ensure your <strong>Supabase Dashboard &gt; Authentication &gt; URL Configuration settings</strong> (Site URL and Redirect URLs) match the exact domain you are using. Configure the Site URL to <code>https://oxisuretech-retention-app.web.app</code> and include matching redirect wildcard patterns.</p>
            </div>
          )}
        </div>

        <Link href="/web/start" className="w-full mt-2">
           <Button type="button" fullWidth variant="primary">
             Go Back to Sign In
           </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function AuthCodeError() {
  return (
    <div className="page-container justify-center pb-8">
      <header className="flex items-center justify-center py-2 mb-4">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
      </header>

      <Suspense fallback={
        <Card bordered className="mb-6 p-6">
          <div className="flex flex-col items-center text-center gap-4 animate-pulse">
            <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">Loading error details...</h1>
          </div>
        </Card>
      }>
        <AuthErrorContent />
      </Suspense>
      
      <p className="text-center text-xs text-[var(--color-text-muted)] mt-auto pt-4">
        Need help? Contact support@oxisuretechsolutions.com
      </p>
    </div>
  )
}
