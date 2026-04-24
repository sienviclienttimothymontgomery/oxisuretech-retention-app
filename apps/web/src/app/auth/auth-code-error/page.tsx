import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { AlertCircle } from "lucide-react";

export default function AuthCodeError() {
  return (
    <div className="page-container justify-center pb-8">
      <header className="flex items-center justify-center py-2 mb-4">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
      </header>

      <Card bordered className="mb-6 p-6 animate-fade-up">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-danger)]/10 flex items-center justify-center">
            <AlertCircle size={24} className="text-[var(--color-danger)]" />
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
              Link Expired or Invalid
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              The magic link you clicked is no longer valid. It may have expired or already been used.
            </p>
          </div>

          <Link href="/web/start" className="w-full mt-2">
             <Button type="button" fullWidth variant="primary">
               Request New Link
             </Button>
          </Link>
        </div>
      </Card>
      
      <p className="text-center text-xs text-[var(--color-text-muted)] mt-auto pt-4">
        Need help? Contact support@oxisuretechsolutions.com
      </p>
    </div>
  )
}
