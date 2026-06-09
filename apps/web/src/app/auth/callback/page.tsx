import { Suspense } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import CallbackClient from "./CallbackClient";

export const dynamic = "force-dynamic";

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
        <CallbackClient />
      </Suspense>
    </div>
  );
}
