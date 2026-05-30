"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Tag, ExternalLink, ShoppingCart, Check, Shield, Truck, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { buildCartUrl, getDiscountTier, SHOPIFY_CONFIG } from "@/utils/shopify";

type StatusType = "on-track" | "due-soon" | "overdue" | "recovery";

const STATUS_TO_DAYS: Record<StatusType, number> = {
  "on-track": 60,
  "due-soon": 20,
  overdue: 5,
  recovery: 0,
};

export default function ReorderPage() {
  const [quantity, setQuantity] = useState(1);
  const [demoStatus, setDemoStatus] = useState<StatusType>("on-track");

  const daysLeft = STATUS_TO_DAYS[demoStatus];
  const tier = getDiscountTier(daysLeft);
  const price = SHOPIFY_CONFIG.product.price;
  const cartUrl = buildCartUrl(quantity, daysLeft, "web");

  const statusOrder: StatusType[] = ["on-track", "due-soon", "overdue", "recovery"];

  const subtotal = price * quantity;
  const discountAmount = subtotal * (tier.percent / 100);
  const total = subtotal - discountAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] via-[#E8F0FE] to-[#F0F4F8]">
      {/* Top nav bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/web/dashboard" className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors min-h-0">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <Image src="/logo.png" alt="OxiSure Tech" width={160} height={48} className="h-8 w-auto" />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero discount banner */}
        <div className="bg-gradient-to-r from-[#1B365D] via-[#2A4A7F] to-[#0EA5E9] rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Tag size={22} />
                <span className="text-3xl font-extrabold">{tier.percent}% Off</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  {tier.label}
                </span>
              </div>
              <p className="text-white/80 text-sm max-w-md">{tier.message}</p>
              <p className="text-white/50 text-xs mt-1">Code <strong className="text-white/70">{tier.code}</strong> auto-applied at checkout</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-white/50 text-xs line-through">${subtotal.toFixed(2)}</span>
              <span className="text-4xl font-extrabold">${total.toFixed(2)}</span>
              <span className="text-white/60 text-xs">after discount</span>
            </div>
          </div>
        </div>

        {/* Demo toggle */}
        <div className="mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-dashed border-[var(--color-border)]">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-3 uppercase tracking-wider">
            ⚙ Demo: Switch discount tier
          </p>
          <div className="flex gap-2 flex-wrap">
            {statusOrder.map((s) => {
              const t = getDiscountTier(STATUS_TO_DAYS[s]);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDemoStatus(s)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all min-h-0 ${
                    demoStatus === s
                      ? "bg-[var(--color-primary)] text-white shadow-md scale-105"
                      : "bg-white text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  }`}
                >
                  {t.label} ({t.percent}%)
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-column layout for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Product details */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Your Order</h2>

            {/* Product card */}
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-xl bg-[var(--color-bg-subtle)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--color-border)]">
                  <Image src="/product-tubing.png" alt="Oxygen Tubing" width={80} height={80} className="object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--color-text)] text-lg">{SHOPIFY_CONFIG.product.title}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">50ft Non-Kinking High-Flow Hose</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">SKU: {SHOPIFY_CONFIG.product.sku}</p>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-xl font-bold text-[var(--color-text)]">${price.toFixed(2)}</span>
                    <span className="text-sm text-[var(--color-text-muted)] line-through">${SHOPIFY_CONFIG.product.compareAtPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quantity control */}
              <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">Quantity</span>
                <div className="flex items-center gap-0 border border-[var(--color-border)] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] transition-colors font-medium text-lg min-h-0"
                  >
                    −
                  </button>
                  <span className="w-12 h-11 flex items-center justify-center font-bold text-[var(--color-text)] border-x border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 flex items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-subtle)] transition-colors font-medium text-lg min-h-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Shield, label: "Medical-Grade Quality", color: "text-emerald-600" },
                { icon: Truck, label: "Free Shipping over $50", color: "text-blue-600" },
                { icon: RotateCcw, label: "30-Day Replacement", color: "text-violet-600" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center">
                  <Icon size={20} className={`${color} mx-auto mb-2`} />
                  <p className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order summary + CTA */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-bold text-[var(--color-text)] mb-5">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">Subtotal ({quantity} {quantity === 1 ? "item" : "items"})</span>
                  <span className="text-sm font-medium text-[var(--color-text)]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-text-secondary)]">Shipping</span>
                  <span className="text-sm font-medium text-emerald-600">{subtotal >= 50 ? "Free" : "$5.99"}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600">
                  <div className="flex items-center gap-1.5">
                    <Tag size={14} />
                    <span className="text-sm font-semibold">{tier.percent}% discount</span>
                  </div>
                  <span className="text-sm font-semibold">-${discountAmount.toFixed(2)}</span>
                </div>

                <div className="border-t border-[var(--color-border)] pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-[var(--color-text)]">Total</span>
                    <span className="text-2xl font-extrabold text-[var(--color-text)]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo code display */}
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-700">
                  <strong>{tier.code}</strong> — {tier.percent}% off applied automatically
                </span>
              </div>

              {/* CTA */}
              <a href={cartUrl} target="_blank" rel="noopener noreferrer" className="block mt-6">
                <Button variant="primary" size="lg" fullWidth icon={<ShoppingCart size={18} />}>
                  Checkout on Shopify
                </Button>
              </a>

              <p className="text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1 mt-3">
                <ExternalLink size={11} />
                Opens Shopify with cart pre-loaded
              </p>

              {/* Security badges */}
              <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex items-center justify-center gap-4 text-[var(--color-text-muted)]">
                <div className="flex items-center gap-1 text-xs">
                  <Shield size={12} />
                  SSL Secure
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Check size={12} />
                  Verified Store
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
