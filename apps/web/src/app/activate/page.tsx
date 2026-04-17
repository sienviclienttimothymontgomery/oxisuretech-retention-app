"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ScanLine, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PrototypeNav from "@/components/ui/PrototypeNav";

export default function ActivatePage() {
  return (
    <>
      <div className="page-container justify-center pb-8">
        {/* Header */}
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
        </header>

        {/* Scan confirmation */}
        <section className="text-center mb-4 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
            <ScanLine size={32} className="text-[var(--color-success)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Product Detected
          </h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            We found your oxygen tubing purchase. Let&apos;s set up your replacement tracker.
          </p>
        </section>

        {/* Product card */}
        <Card className="mb-5" bordered>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] flex items-center justify-center overflow-hidden shrink-0">
              <Image src="/product-tubing.png" alt="Oxygen Tubing" width={56} height={56} className="object-contain" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text)]">OxiSure Oxygen Tubing</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Standard 7ft Nasal Cannula</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Recommended replacement: every 30 days</p>
            </div>
          </div>
        </Card>

        {/* What you'll get */}
        <section className="mb-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            What You&apos;ll Get
          </h2>
          <div className="space-y-2">
            {[
              "Personalized replacement countdown",
              "Timely reminders so you never run out",
              "Exclusive reorder savings",
            ].map((text) => (
              <div key={text} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 shrink-0" />
                <span className="text-sm text-[var(--color-text-secondary)]">{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-auto space-y-3">
          <Link href="/web/start" className="block">
            <Button variant="primary" size="lg" fullWidth icon={<ArrowRight size={20} />}>
              Set Up My Tracker
            </Button>
          </Link>
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            Takes less than 2 minutes
          </p>
        </section>
      </div>
      <PrototypeNav />
    </>
  );
}
