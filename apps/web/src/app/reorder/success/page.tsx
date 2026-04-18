"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw, LayoutDashboard } from "lucide-react";
import SuccessState from "@/components/ui/SuccessState";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ReorderSuccessPage() {
  return (
    <>
      <div className="page-container pb-8 justify-center">
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
        </header>

        <SuccessState
          title="Order Placed!"
          message="Your tubing is on the way. We've automatically reset your replacement countdown."
        >
          {/* Lifecycle reset info */}
          <Card bordered className="text-left mb-4">
            <div className="flex items-center gap-3 mb-3">
              <RotateCcw size={18} className="text-[var(--color-primary)]" />
              <span className="font-semibold text-sm text-[var(--color-text)]">Cycle Reset</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">New replacement date</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">May 9, 2026</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Days until next change</span>
                <span className="text-sm font-semibold text-[var(--color-success)]">30 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Qty ordered</span>
                <span className="text-sm font-semibold text-[var(--color-text)]">1 tube</span>
              </div>
            </div>
          </Card>

          {/* Next steps */}
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button variant="primary" size="lg" fullWidth icon={<LayoutDashboard size={18} />}>
                Go to Dashboard
              </Button>
            </Link>
            <p className="text-center text-xs text-[var(--color-text-muted)]">
              We&apos;ll remind you when it&apos;s time for your next replacement.
            </p>
          </div>
        </SuccessState>
      </div>
    </>
  );
}
