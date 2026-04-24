"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PackageCheck, ArrowRight, Loader2, ShieldCheck, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/utils/supabase/client";
import { completeOrderVerification } from "@/app/actions";

export default function ActivatePage() {
  const [orderId, setOrderId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setIsLoading(true);
    setError(null);

    // Call the edge function to verify the order via Amazon MCF / Shopify
    const { data, error: functionError } = await supabase.functions.invoke('verify-order', {
      body: { orderId: orderId.trim() }
    });

    setIsLoading(false);

    if (functionError || !data?.success) {
      setError(data?.error || "We couldn't find an order matching that ID. Please check your confirmation email and try again.");
    } else {
      setIsVerified(true);
    }
  };

  if (!isVerified) {
    return (
      <div className="page-container justify-center pb-8">
        <header className="flex items-center justify-center py-2 mb-6">
          <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
        </header>

        <section className="text-center mb-6 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-[var(--color-primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Verify Your Purchase
          </h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            Enter your Amazon or Shopify Order ID to unlock your free replacement tracker.
          </p>
        </section>

        <Card bordered className="mb-5 animate-fade-up">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                Order ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--color-text-muted)]">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. 111-1234567-1234567"
                  className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-3 pl-10 rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-all"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-[var(--color-danger)] mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading || !orderId.trim()}
              icon={isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
            >
              {isLoading ? "Verifying..." : "Verify Order"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-auto pt-4">
          You can find your Order ID in your confirmation email or order history.
        </p>
      </div>
    );
  }

  return (
    <div className="page-container justify-center pb-8 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-center py-2">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
      </header>

      {/* Order confirmation */}
      <section className="text-center mb-4 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
          <PackageCheck size={32} className="text-[var(--color-success)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Order Verified
        </h1>
        <p className="text-base text-[var(--color-text-secondary)]">
          We found your oxygen tubing purchase. Let&apos;s set up your replacement tracker.
        </p>
      </section>

      {/* Product card */}
      <Card className="mb-5 animate-fade-up" style={{ animationDelay: '100ms' }} bordered>
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
      <section className="mb-5 animate-fade-up" style={{ animationDelay: '200ms' }}>
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
      <section className="mt-auto space-y-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
        <form action={completeOrderVerification} className="block">
          <Button type="submit" variant="primary" size="lg" fullWidth icon={<ArrowRight size={20} />}>
            Set Up My Tracker
          </Button>
        </form>
      </section>
    </div>
  );
}
