"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, ScanLine } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import ProductCard from "@/components/ui/ProductCard";
import PrototypeNav from "@/components/ui/PrototypeNav";

export default function WebStartPage() {
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <div className="page-container pb-8">
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
        </header>

        {/* Web path indicator */}
        <div className="flex items-center gap-2 mb-4 justify-center">
          <Globe size={16} className="text-[var(--color-accent)]" />
          <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
            Web Tracker
          </span>
        </div>

        <section className="mb-4">
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Quick Setup
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Enter your email to set up your replacement tracker. We&apos;ll send you a
            link to access your dashboard — no password needed.
          </p>
        </section>

        {/* Email input */}
        <section className="mb-5">
          <InputField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="We'll send you a magic link for instant access."
          />
        </section>

        {/* Alternative Verification */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 border-t border-[var(--color-border)]" />
          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">or verify product directly</span>
          <div className="flex-1 border-t border-[var(--color-border)]" />
        </div>

        <section className="mb-10">
          <Link href="/activate" className="block">
            <button className="w-full flex justify-center items-center gap-2 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity py-3.5 border-2 border-dashed border-[var(--color-primary)]/30 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50">
              <ScanLine size={18} />
              Scan FNSKU code
            </button>
          </Link>
        </section>

        {/* Product confirmation */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Your Product
          </h2>
          <ProductCard
            name="OxiSure Oxygen Tubing"
            description="Standard 7ft Nasal Cannula"
            quantity={quantity}
            onQuantityChange={setQuantity}
            showQuantity
          />
        </section>

        <section className="mt-auto space-y-3">
          <Link href="/web/check-email" className={`block ${!email ? "pointer-events-none" : ""}`}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!email}
              icon={<ArrowRight size={20} />}
            >
              Send Me My Link
            </Button>
          </Link>
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            No app install required. Access anytime from any device.
          </p>
        </section>
      </div>
      <PrototypeNav />
    </>
  );
}
