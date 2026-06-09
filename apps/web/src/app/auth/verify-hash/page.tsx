import { Suspense } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import VerifyHashClient from "./VerifyHashClient";

export const dynamic = "force-dynamic";

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
        <VerifyHashClient />
      </Suspense>
    </div>
  );
}
