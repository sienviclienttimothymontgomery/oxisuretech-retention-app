"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import PrototypeNav from "@/components/ui/PrototypeNav";

const STEPS = ["Type", "Product", "Quantity", "Alerts", "Done"];

export default function AppQuantityPage() {
  const [quantity, setQuantity] = useState(1);

  return (
    <>
      <div className="page-container pb-8">
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={380} height={112} className="h-28 w-auto" />
        </header>

        <StepIndicator steps={STEPS} currentStep={2} />

        <section className="mb-4">
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            How Many Do You Use?
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            This helps us calculate your replacement schedule accurately.
          </p>
        </section>

        {/* Quantity selector */}
        <section className="flex flex-col items-center py-8 mb-4">
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
            Tubes replaced per cycle
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-14 h-14 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus size={24} />
            </button>
            <span className="text-5xl font-bold text-[var(--color-text)] w-16 text-center tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              className="w-14 h-14 rounded-full border-2 border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors"
              aria-label="Increase quantity"
            >
              <Plus size={24} />
            </button>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-4">
            Most users replace {quantity === 1 ? "1 tube" : `${quantity} tubes`} every 30 days
          </p>
        </section>

        {/* Frequency hint */}
        {quantity > 1 && (
          <div className="bg-[var(--color-info-bg)] rounded-[var(--radius-md)] p-4 mb-5">
            <p className="text-sm text-[var(--color-info)]">
              We&apos;ll track all <strong>{quantity} tubes</strong> on the same 30-day cycle for easy reordering.
            </p>
          </div>
        )}

        <section className="mt-auto">
          <Link href="/app/notifications" className="block">
            <Button variant="primary" size="lg" fullWidth icon={<ArrowRight size={20} />}>
              Continue
            </Button>
          </Link>
        </section>
      </div>
      <PrototypeNav />
    </>
  );
}
