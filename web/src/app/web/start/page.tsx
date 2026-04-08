"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import ProductCard from "@/components/ui/ProductCard";
import PrototypeNav from "@/components/ui/PrototypeNav";

export default function WebStartPage() {
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <div className="page-container pb-16">
        <header className="flex items-center justify-center pt-2 pb-4">
          <Image src="/logo.png" alt="OxiSure Tech" width={120} height={36} className="h-9 w-auto" />
        </header>

        {/* Web path indicator */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          <Globe size={16} className="text-[var(--color-accent)]" />
          <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider">
            Web Tracker
          </span>
        </div>

        <section className="mb-6">
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Quick Setup
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Enter your email to set up your replacement tracker. We&apos;ll send you a
            link to access your dashboard — no password needed.
          </p>
        </section>

        {/* Email input */}
        <section className="mb-6">
          <InputField
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hint="We'll send you a magic link for instant access."
          />
        </section>

        {/* Product confirmation */}
        <section className="mb-6">
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
