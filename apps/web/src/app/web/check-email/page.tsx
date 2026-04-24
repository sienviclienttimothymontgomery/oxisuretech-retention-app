"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function WebCheckEmailPage() {
  return (
    <>
      <div className="page-container justify-center items-center text-center pb-8">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto mb-5" />

        {/* Email sent state */}
        <div className="w-20 h-20 rounded-full bg-[var(--color-info-bg)] flex items-center justify-center mb-4 animate-fade-up">
          <Mail size={40} className="text-[var(--color-info)]" />
        </div>

        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Check Your Email
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] max-w-xs mx-auto mb-5">
          We sent a magic link to your inbox. Click it to access your dashboard instantly.
        </p>

        <Card bordered className="mb-5 text-left">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--color-primary)] shrink-0">1</span>
              <p className="text-sm text-[var(--color-text-secondary)]">Open the email from <strong>OxiSure Tech</strong></p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--color-primary)] shrink-0">2</span>
              <p className="text-sm text-[var(--color-text-secondary)]">Click the <strong>&quot;Open My Dashboard&quot;</strong> button</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-xs font-bold text-[var(--color-primary)] shrink-0">3</span>
              <p className="text-sm text-[var(--color-text-secondary)]">You&apos;re in! Bookmark the page for easy access.</p>
            </div>
          </div>
        </Card>

        <div className="w-full mt-6">
          <p className="text-sm text-[var(--color-text-muted)]">
            Didn&apos;t get it? Check spam or{" "}
            <Link href="/web/start" className="text-[var(--color-primary)] hover:underline">
              request a new link
            </Link>.
          </p>
        </div>
      </div>
    </>
  );
}
