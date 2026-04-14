"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Globe, Mail, ChevronRight } from "lucide-react";
import DatePanel from "@/components/ui/DatePanel";
import CTASection from "@/components/ui/CTASection";
import Card from "@/components/ui/Card";
import PrototypeNav from "@/components/ui/PrototypeNav";

export default function WebDashboardPage() {
  return (
    <>
      <div className="page-container pb-20">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={380} height={112} className="h-28 w-auto" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-full)] bg-[var(--color-accent)]/10">
            <Globe size={12} className="text-[var(--color-accent)]" />
            <span className="text-xs font-semibold text-[var(--color-accent)]">Web Tracker</span>
          </div>
        </header>

        {/* Greeting */}
        <section className="mb-2">
          <h1 className="text-lg font-semibold text-[var(--color-text)]">Your Tubing Tracker</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Simple. No guesswork.</p>
        </section>

        {/* Date countdown */}
        <DatePanel
          daysRemaining={12}
          nextDate="April 21, 2026"
          status="on-track"
          productName="OxiSure Oxygen Tubing · 1 tube"
        />

        {/* Reorder CTA */}
        <section className="mb-4">
          <CTASection
            headline="Time to Reorder?"
            description="Order now and save with your early reorder discount."
            buttonLabel="Reorder Now"
            buttonIcon={<ShoppingCart size={20} />}
            href="/reorder"
            variant="primary"
            discount="10% Off — Early Reorder"
          />
        </section>

        {/* Product summary */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Product Details
          </h2>
          <Card bordered>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[var(--radius-sm)] bg-[var(--color-bg-subtle)] flex items-center justify-center overflow-hidden shrink-0">
                <Image src="/product-tubing.png" alt="Oxygen Tubing" width={48} height={48} className="object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[var(--color-text)]">OxiSure Oxygen Tubing</p>
                <p className="text-xs text-[var(--color-text-muted)]">7ft Nasal Cannula · Qty: 1</p>
                <p className="text-xs text-[var(--color-text-muted)]">30-day cycle</p>
              </div>
              <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
            </div>
          </Card>
        </section>

        {/* Reminder status */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Reminders
          </h2>
          <Card bordered>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-[var(--color-success)] shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--color-text)]">Email reminders active</p>
                <p className="text-xs text-[var(--color-text-muted)]">You&apos;ll get an email 7 and 3 days before each replacement date.</p>
              </div>
            </div>
          </Card>
        </section>

        {/* Upgrade nudge */}
        <section>
          <Card bordered hoverable className="bg-[var(--color-bg-subtle)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <span className="text-lg">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">Want more features?</p>
                <p className="text-xs text-[var(--color-text-muted)]">Download the app for push alerts, caregiver tracking, and better savings.</p>
              </div>
              <ChevronRight size={16} className="text-[var(--color-text-muted)]" />
            </div>
          </Card>
        </section>
      </div>
      <PrototypeNav />
    </>
  );
}
