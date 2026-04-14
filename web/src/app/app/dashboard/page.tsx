"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Users, Package, Settings, ChevronRight } from "lucide-react";
import DatePanel from "@/components/ui/DatePanel";
import CTASection from "@/components/ui/CTASection";
import Card from "@/components/ui/Card";
import CaregiverCard from "@/components/ui/CaregiverCard";
import Button from "@/components/ui/Button";
import PrototypeNav from "@/components/ui/PrototypeNav";

type DashView = "self" | "caregiver";

export default function AppDashboardPage() {
  const [view, setView] = useState<DashView>("self");

  return (
    <>
      <div className="page-container pb-20">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={380} height={112} className="h-28 w-auto" />
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-[var(--color-text-muted)]"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </header>

        {/* Greeting */}
        <section className="mb-2">
          <h1 className="text-lg font-semibold text-[var(--color-text)]">Good morning 👋</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Here&apos;s your tubing status</p>
        </section>

        {/* View toggle (self vs caregiver) */}
        <div className="flex bg-[var(--color-bg-muted)] rounded-[var(--radius-md)] p-1 mb-4">
          <button
            type="button"
            onClick={() => setView("self")}
            className={`flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
              view === "self"
                ? "bg-[var(--color-surface)] shadow-[var(--shadow-sm)] text-[var(--color-text)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            My Tracker
          </button>
          <button
            type="button"
            onClick={() => setView("caregiver")}
            className={`flex-1 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all ${
              view === "caregiver"
                ? "bg-[var(--color-surface)] shadow-[var(--shadow-sm)] text-[var(--color-text)]"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Users size={14} /> People I Manage
            </span>
          </button>
        </div>

        {view === "self" ? (
          /* ===== Self View ===== */
          <>
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
                headline="Ready to Reorder?"
                description="Order now and save — your next tube is almost due."
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
                Your Product
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
                Reminder Settings
              </h2>
              <Card bordered>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">Push Notifications</span>
                    <span className="text-sm font-semibold text-[var(--color-success)]">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">Email Reminders</span>
                    <span className="text-sm font-semibold text-[var(--color-success)]">Active</span>
                  </div>
                </div>
              </Card>
            </section>

            {/* Future bulk recommendation zone */}
            <section>
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                Recommended for You
              </h2>
              <Card bordered className="bg-[var(--color-bg-subtle)]">
                <div className="flex items-center gap-3 py-2">
                  <Package size={20} className="text-[var(--color-text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Bulk recommendations coming soon</p>
                    <p className="text-xs text-[var(--color-text-muted)]">We&apos;ll suggest savings based on your usage.</p>
                  </div>
                </div>
              </Card>
            </section>
          </>
        ) : (
          /* ===== Caregiver View ===== */
          <>
            <section className="mb-4">
              <h2 className="text-base font-semibold text-[var(--color-text)] mb-1">
                People You Manage
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                Track tubing replacements for your loved ones.
              </p>

              <div className="space-y-3">
                <CaregiverCard
                  name="Margaret Johnson"
                  relationship="Mother"
                  daysRemaining={5}
                  status="due-soon"
                />
                <CaregiverCard
                  name="Robert Johnson"
                  relationship="Father"
                  daysRemaining={18}
                  status="on-track"
                />
                <CaregiverCard
                  name="Helen Williams"
                  relationship="Neighbor"
                  daysRemaining={-3}
                  status="overdue"
                />
              </div>
            </section>

            <section>
              <Button variant="secondary" size="md" fullWidth>
                + Add Another Person
              </Button>
            </section>
          </>
        )}
      </div>
      <PrototypeNav />
    </>
  );
}
