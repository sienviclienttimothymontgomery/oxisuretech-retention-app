"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield, Clock, Bell, PackageCheck, Hash } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <>
      <div className="page-container justify-between pb-8">
        {/* Header */}
        <header className="flex items-center justify-center py-2">
          <Image
            src="/logo.png"
            alt="OxiSure Tech"
            width={420} height={128} priority className="h-32 w-auto"
          />
        </header>

        {/* Hero */}
        <section className="text-center mb-5 animate-fade-up">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-3 leading-tight">
            Your Tubing. <br />
            Always Fresh. <br />
            <span className="text-[var(--color-accent)]">Never Forgotten.</span>
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-xs mx-auto leading-relaxed">
            Track your oxygen tubing replacement schedule and reorder at the right time — automatically.
          </p>
        </section>

        {/* Value props */}
        <section className="space-y-3 mb-5" aria-label="Features">
          {[
            { icon: Clock, text: "Know exactly when it's time to replace" },
            { icon: Bell, text: "Get reminders before you run low" },
            { icon: PackageCheck, text: "Reorder in one tap with exclusive savings" },
            { icon: Shield, text: "Trusted by oxygen therapy users nationwide" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)]"
            >
              <item.icon size={20} className="text-[var(--color-primary)] shrink-0" />
              <span className="text-sm font-medium text-[var(--color-text)]">{item.text}</span>
            </div>
          ))}
        </section>

        {/* Product preview */}
        <section className="flex justify-center mb-5">
          <div className="w-32 h-32 rounded-[var(--radius-lg)] bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
            <Image
              src="/product-tubing.png"
              alt="Oxygen tubing"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-3 mt-auto">
          <Link href="/activate" className="block">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<ArrowRight size={20} />}
            >
              Get Started
            </Button>
          </Link>
          <Link href="/activate" className="block">
            <button className="w-full flex justify-center items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors py-3 border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] focus:outline-none">
              <Hash size={18} />
              Enter order number to verify product
            </button>
          </Link>
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            Free to use. No credit card required.
          </p>
        </section>
      </div>
    </>
  );
}
