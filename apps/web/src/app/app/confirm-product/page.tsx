"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import ProductCard from "@/components/ui/ProductCard";
import { submitProduct } from "@/app/actions";

const STEPS = ["Type", "Product", "Quantity", "Done"];

export default function AppConfirmProductPage() {
  return (
    <>
      <div className="page-container pb-8">
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={380} height={112} className="h-28 w-auto" />
        </header>

        <StepIndicator steps={STEPS} currentStep={1} />

        <section className="mb-4">
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

        <div className="bg-[var(--color-info-bg)] rounded-[var(--radius-md)] p-4 mb-5">
          <p className="text-sm text-[var(--color-info)] font-medium">
            Recommended replacement cycle: <strong>Every 30 days</strong>
          </p>
          <p className="text-xs text-[var(--color-info)]/70 mt-1">
            Based on medical guidelines for continuous-use oxygen tubing.
          </p>
        </div>

        <section className="mt-auto space-y-3">
          <form action={() => submitProduct("OXI-TUB-07")}>
            <Button type="submit" variant="primary" size="lg" fullWidth icon={<ArrowRight size={20} />}>
              Yes, This Is Correct
            </Button>
          </form>
          <Button variant="ghost" size="md" fullWidth>
            This isn&apos;t my product
          </Button>
          <Link href="/app/user-type" className="block text-center text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors py-1">
            ← Back
          </Link>
        </section>
      </div>
    </>
  );
}
