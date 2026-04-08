"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PathCard from "@/components/ui/PathCard";
import Button from "@/components/ui/Button";
import PrototypeNav from "@/components/ui/PrototypeNav";
import { ArrowRight } from "lucide-react";

export default function ChoosePathPage() {
  const [selected, setSelected] = useState<"app" | "web" | null>(null);

  const nextHref = selected === "app" ? "/app/welcome" : selected === "web" ? "/web/start" : "#";

  return (
    <>
      <div className="page-container pb-16">
        {/* Header */}
        <header className="flex items-center justify-center pt-2 pb-4">
          <Image src="/logo.png" alt="OxiSure Tech" width={120} height={36} className="h-9 w-auto" />
        </header>

        {/* Heading */}
        <section className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
            How Would You Like to Track?
          </h1>
          <p className="text-base text-[var(--color-text-secondary)]">
            Choose the option that works best for you.
          </p>
        </section>

        {/* Path cards */}
        <section className="space-y-4 mb-8" role="radiogroup" aria-label="Choose tracking method">
          <PathCard
            path="app"
            selected={selected === "app"}
            onSelect={() => setSelected("app")}
          />
          <div className="flex items-center gap-3 px-4">
            <div className="flex-1 border-t border-[var(--color-border)]" />
            <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-[var(--color-border)]" />
          </div>
          <PathCard
            path="web"
            selected={selected === "web"}
            onSelect={() => setSelected("web")}
          />
        </section>

        {/* CTA */}
        <section className="mt-auto space-y-3">
          <Link href={nextHref} className={`block ${!selected ? "pointer-events-none" : ""}`}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!selected}
              icon={<ArrowRight size={20} />}
            >
              Continue
            </Button>
          </Link>
          {selected === "web" && (
            <p className="text-center text-xs text-[var(--color-text-muted)]">
              You can always switch to the app later.
            </p>
          )}
        </section>
      </div>
      <PrototypeNav />
    </>
  );
}
