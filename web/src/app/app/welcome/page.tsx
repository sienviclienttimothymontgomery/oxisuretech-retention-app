"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import PrototypeNav from "@/components/ui/PrototypeNav";

export default function AppWelcomePage() {
  return (
    <>
      <div className="page-container justify-center items-center text-center pb-16">
        {/* Logo */}
        <Image src="/logo.png" alt="OxiSure Tech" width={140} height={42} className="h-10 w-auto mb-8" />

        {/* Welcome illustration area */}
        <div className="w-24 h-24 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-6 animate-fade-up">
          <Sparkles size={40} className="text-[var(--color-primary)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">
          Welcome to OxiSure
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-xs mx-auto mb-2">
          We&apos;ll help you keep your oxygen tubing fresh and your replacements on schedule.
        </p>
        <p className="text-sm text-[var(--color-text-muted)] max-w-xs mx-auto mb-10">
          This quick setup takes about 1 minute.
        </p>

        <div className="w-full mt-auto space-y-3">
          <Link href="/app/user-type" className="block">
            <Button variant="primary" size="lg" fullWidth>
              Let&apos;s Get Started
            </Button>
          </Link>
        </div>
      </div>
      <PrototypeNav />
    </>
  );
}
