"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PackageCheck, ArrowRight, Loader2, ShieldCheck, Search, ArrowLeft, Clock, Bell, Tag } from "lucide-react";
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

    // Call the edge function to verify the order via Shopify
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
      <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] via-[#E8F0FE] to-[#F0F4F8] flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-6 py-12">
          <header className="flex items-center justify-center mb-10">
            <Image src="/logo.png" alt="OxiSure Tech" width={240} height={72} className="h-16 w-auto" />
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: info */}
            <div className="animate-fade-up">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mb-5">
                <ShieldCheck size={32} className="text-[var(--color-primary)]" />
              </div>
              <h1 className="text-3xl font-extrabold text-[var(--color-text)] mb-3">
                Verify Your Purchase
              </h1>
              <p className="text-base text-[var(--color-text-secondary)] mb-8">
                Enter your Shopify Order ID to unlock your free replacement tracker and start managing your oxygen tubing lifecycle.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Clock, text: "Personalized replacement countdown" },
                  { icon: Bell, text: "Timely reminders so you never run out" },
                  { icon: Tag, text: "Exclusive reorder savings up to 20% off" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[var(--color-accent)]" />
                    </div>
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: form */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-lg p-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
              <form onSubmit={handleVerify} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text)] mb-2">
                    Order ID
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--color-text-muted)]">
                      <Search size={18} />
                    </div>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. #1234 or OXI-1234"
                      className="w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-3.5 pl-11 rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)] transition-all"
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

              <p className="text-center text-xs text-[var(--color-text-muted)] mt-5">
                You can find your Order ID in your confirmation email or Shopify order history.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] via-[#E8F0FE] to-[#F0F4F8] flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto px-6 py-12">
        <header className="flex items-center justify-center mb-8">
          <Image src="/logo.png" alt="OxiSure Tech" width={200} height={60} className="h-12 w-auto" />
        </header>

        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-lg p-8 text-center animate-fade-in">
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-5">
            <PackageCheck size={32} className="text-[var(--color-success)]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)] mb-2">
            Order Verified ✓
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6">
            We found your oxygen tubing purchase. Let&apos;s set up your replacement tracker.
          </p>

          {/* Product card */}
          <div className="bg-[var(--color-bg-subtle)] rounded-xl p-4 flex items-center gap-4 text-left mb-6">
            <div className="w-14 h-14 rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 border border-[var(--color-border)]">
              <Image src="/product-tubing.png" alt="Oxygen Tubing" width={48} height={48} className="object-contain" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--color-text)]">OxiSure Oxygen Tubing</p>
              <p className="text-xs text-[var(--color-text-secondary)]">Standard 7ft Nasal Cannula</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Recommended replacement: every 30 days</p>
            </div>
          </div>

          {/* CTA */}
          <form action={completeOrderVerification}>
            <Button type="submit" variant="primary" size="lg" fullWidth icon={<ArrowRight size={20} />}>
              Set Up My Tracker
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
