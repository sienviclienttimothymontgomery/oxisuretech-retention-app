"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Mail, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import Card from "@/components/ui/Card";

const STEPS = ["Type", "Product", "Quantity", "Alerts", "Done"];

export default function AppNotificationsPage() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  return (
    <>
      <div className="page-container pb-8">
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={380} height={112} className="h-28 w-auto" />
        </header>

        <StepIndicator steps={STEPS} currentStep={3} />

        <section className="mb-4">
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Stay on Schedule
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Choose how you&apos;d like to be reminded when it&apos;s time to replace your tubing.
          </p>
        </section>

        <section className="space-y-3 mb-5">
          {/* Push notifications toggle */}
          <Card bordered>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                <Bell size={20} className="text-[var(--color-primary)]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[var(--color-text)]">Push Notifications</p>
                <p className="text-xs text-[var(--color-text-muted)]">Get alerted directly on your phone</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={pushEnabled}
                aria-label="Toggle push notifications"
                onClick={() => setPushEnabled(!pushEnabled)}
                className={`
                  relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 cursor-pointer
                  ${pushEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200
                    ${pushEnabled ? "translate-x-5.5" : "translate-x-0.5"}
                  `}
                />
              </button>
            </div>
          </Card>

          {/* Email toggle */}
          <Card bordered>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-[var(--color-accent)]" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[var(--color-text)]">Email Reminders</p>
                <p className="text-xs text-[var(--color-text-muted)]">Receive reminders in your inbox</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={emailEnabled}
                aria-label="Toggle email reminders"
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`
                  relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 cursor-pointer
                  ${emailEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"}
                `}
              >
                <span
                  className={`
                    absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200
                    ${emailEnabled ? "translate-x-5.5" : "translate-x-0.5"}
                  `}
                />
              </button>
            </div>
          </Card>
        </section>

        {/* Push benefit note */}
        {!pushEnabled && !emailEnabled && (
          <div className="bg-[var(--color-warning-bg)] rounded-[var(--radius-md)] p-4 mb-4">
            <p className="text-sm text-[var(--color-warning)]">
              Without reminders, you&apos;ll need to check back manually. We recommend enabling at least one.
            </p>
          </div>
        )}

        <section className="mt-auto space-y-3">
          <Link href="/app/dashboard" className="block">
            <Button variant="primary" size="lg" fullWidth icon={<ArrowRight size={20} />}>
              Complete Setup
            </Button>
          </Link>
          <Link href="/app/quantity" className="block text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-1">
            ← Back
          </Link>
        </section>
      </div>
    </>
  );
}
