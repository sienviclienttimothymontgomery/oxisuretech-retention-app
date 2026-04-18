"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag, ExternalLink } from "lucide-react";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";

type StatusType = "on-track" | "due-soon" | "overdue" | "recovery";

export default function ReorderPage() {
  const [quantity, setQuantity] = useState(1);

  /* Demo: cycle through timed discount tiers */
  const [demoStatus, setDemoStatus] = useState<StatusType>("on-track");

  const discountTiers: Record<StatusType, { percent: string; label: string; message: string }> = {
    "on-track": {
      percent: "10%",
      label: "Early Reorder",
      message: "Order ahead and save 10%. Smart timing!",
    },
    "due-soon": {
      percent: "12%",
      label: "Due Now",
      message: "Your tubing is due — save 12% when you reorder today.",
    },
    overdue: {
      percent: "15%",
      label: "Overdue",
      message: "Your tubing is overdue. Save 15% by ordering now.",
    },
    recovery: {
      percent: "20%",
      label: "Recovery",
      message: "It's been a while. Save 20% to get back on track.",
    },
  };

  const tier = discountTiers[demoStatus];

  const statusOrder: StatusType[] = ["on-track", "due-soon", "overdue", "recovery"];

  return (
    <>
      <div className="page-container pb-8">
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
        </header>

        <section className="mb-4">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            Reorder Your Tubing
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Review your order and proceed to checkout.
          </p>
        </section>

        {/* Discount highlight */}
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-[var(--radius-md)] p-4 mb-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Tag size={18} />
            <span className="font-bold text-lg">{tier.percent} Off</span>
            <StatusBadge status={demoStatus} label={tier.label} pulsate={false} />
          </div>
          <p className="text-sm text-white/80">{tier.message}</p>
        </div>

        {/* Demo: status toggle (prototype-only) */}
        <div className="mb-4 p-3 bg-[var(--color-bg-muted)] rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border)]">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
            ⚙ Demo: Switch discount tier
          </p>
          <div className="flex gap-2 flex-wrap">
            {statusOrder.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDemoStatus(s)}
                className={`px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-medium transition-colors ${
                  demoStatus === s
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                }`}
              >
                {discountTiers[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Product with quantity */}
        <section className="mb-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Your Order
          </h2>
          <ProductCard
            name="OxiSure Oxygen Tubing"
            description="Standard 7ft Nasal Cannula"
            quantity={quantity}
            onQuantityChange={setQuantity}
            showQuantity
            price="$12.99"
          />
        </section>

        {/* Order summary */}
        <section className="mb-5">
          <Card bordered>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-secondary)]">Subtotal ({quantity} {quantity === 1 ? "item" : "items"})</span>
                <span className="text-sm text-[var(--color-text)]">${(12.99 * quantity).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--color-success)]">
                <span className="text-sm font-medium">Discount ({tier.percent})</span>
                <span className="text-sm font-medium">-${(12.99 * quantity * parseInt(tier.percent) / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text)]">Total</span>
                  <span className="font-bold text-lg text-[var(--color-text)]">
                    ${(12.99 * quantity * (1 - parseInt(tier.percent) / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA */}
        <section className="mt-auto space-y-3">
          <Link href="/reorder/success" className="block">
            <Button variant="primary" size="lg" fullWidth icon={<ExternalLink size={18} />}>
              Proceed to Checkout
            </Button>
          </Link>
          <p className="text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1">
            <ExternalLink size={12} />
            You&apos;ll be taken to our secure store to complete your order.
          </p>
        </section>
      </div>
    </>
  );
}
