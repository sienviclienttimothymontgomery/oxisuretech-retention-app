"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw, LayoutDashboard, CheckCircle, Package, Calendar, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ReorderSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] via-[#E8F0FE] to-[#F0F4F8] flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto px-6 py-12">
        {/* Logo */}
        <header className="flex items-center justify-center mb-8">
          <Image src="/logo.png" alt="OxiSure Tech" width={200} height={60} className="h-12 w-auto" />
        </header>

        {/* Success card */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-lg p-8 text-center">
          {/* Animated check */}
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5 animate-fade-up">
            <CheckCircle size={44} className="text-emerald-500" />
          </div>

          <h1 className="text-2xl font-extrabold text-[var(--color-text)] mb-2 animate-fade-up" style={{ animationDelay: '100ms' }}>
            Order Placed! 🎉
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
            Your tubing is on the way. We&apos;ve automatically reset your replacement countdown.
          </p>

          {/* Cycle reset info */}
          <div className="bg-[var(--color-bg-subtle)] rounded-xl p-5 text-left mb-6 animate-fade-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw size={16} className="text-[var(--color-primary)]" />
              <span className="font-semibold text-sm text-[var(--color-text)]">Cycle Reset</span>
            </div>
            <div className="space-y-3">
              {[
                { icon: Calendar, label: "New replacement date", value: "30 days from now", color: "text-[var(--color-text)]" },
                { icon: Package, label: "Qty ordered", value: "1 tube", color: "text-[var(--color-text)]" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-[var(--color-text-muted)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">{label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link href="/web/dashboard" className="block">
              <Button variant="primary" size="lg" fullWidth icon={<LayoutDashboard size={18} />}>
                Go to Dashboard
              </Button>
            </Link>
            <p className="text-xs text-[var(--color-text-muted)]">
              We&apos;ll remind you when it&apos;s time for your next replacement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
