"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import ProductCard from "@/components/ui/ProductCard";
import PrototypeNav from "@/components/ui/PrototypeNav";

const STEPS = ["Type", "Product", "Quantity", "Alerts", "Done"];

export default function AppConfirmProductPage() {
  return (
    <>
      <div className="page-container pb-16">
        <header className="flex items-center justify-center pt-2 pb-4">
          <Image src="/logo.png" alt="OxiSure Tech" width={100} height={30} className="h-7 w-auto" />
        </header>

        <StepIndicator steps={STEPS} currentStep={1} />

        <section className="mb-6">
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Confirm Your Product
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            We detected this product from your purchase. Is this correct?
          </p>
        </section>

        <section className="mb-4">
          <ProductCard
            name="OxiSure Oxygen Tubing"
            description="Standard 7ft Nasal Cannula"
            selected={true}
          />
        </section>

        <div className="bg-[var(--color-info-bg)] rounded-[var(--radius-md)] p-4 mb-8">
          <p className="text-sm text-[var(--color-info)] font-medium">
            Recommended replacement cycle: <strong>Every 30 days</strong>
          </p>
          <p className="text-xs text-[var(--color-info)]/70 mt-1">
            Based on medical guidelines for continuous-use oxygen tubing.
          </p>
        </div>

        <section className="mt-auto space-y-3">
          <Link href="/app/quantity" className="block">
            <Button variant="primary" size="lg" fullWidth icon={<ArrowRight size={20} />}>
              Yes, This Is Correct
            </Button>
          </Link>
          <Button variant="ghost" size="md" fullWidth>
            This isn&apos;t my product
          </Button>
        </section>
      </div>
      <PrototypeNav />
    </>
  );
}
