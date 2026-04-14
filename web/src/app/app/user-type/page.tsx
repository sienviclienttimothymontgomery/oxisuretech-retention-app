"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Users, ArrowRight } from "lucide-react";
import RadioCard from "@/components/ui/RadioCard";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import PrototypeNav from "@/components/ui/PrototypeNav";

const STEPS = ["Type", "Product", "Quantity", "Alerts", "Done"];

export default function AppUserTypePage() {
  const [userType, setUserType] = useState<string>("");

  return (
    <>
      <div className="page-container pb-8">
        <header className="flex items-center justify-center py-2">
          <Image src="/logo.png" alt="OxiSure Tech" width={380} height={112} className="h-28 w-auto" />
        </header>

        <StepIndicator steps={STEPS} currentStep={0} />

        <section className="mb-4">
          <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
            Who is this for?
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            This helps us set up the right experience for you.
          </p>
        </section>

        <section className="space-y-3 mb-5" role="radiogroup" aria-label="User type selection">
          <RadioCard
            value="self"
            label="Just for me"
            description="I use oxygen tubing and want to track my own replacements."
            icon={<User size={20} />}
            selected={userType === "self"}
            onSelect={setUserType}
          />
          <RadioCard
            value="caregiver"
            label="I'm a caregiver"
            description="I help manage supplies for one or more people who use oxygen."
            icon={<Users size={20} />}
            selected={userType === "caregiver"}
            onSelect={setUserType}
          />
        </section>

        <section className="mt-auto">
          <Link href="/app/confirm-product" className={`block ${!userType ? "pointer-events-none" : ""}`}>
            <Button variant="primary" size="lg" fullWidth disabled={!userType} icon={<ArrowRight size={20} />}>
              Continue
            </Button>
          </Link>
        </section>
      </div>
      <PrototypeNav />
    </>
  );
}
