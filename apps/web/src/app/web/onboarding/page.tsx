import React from "react";
import Image from "next/image";
import Button from '@/components/ui/Button'
import StepIndicator from "@/components/ui/StepIndicator";
import Card from "@/components/ui/Card";
import { submitWebOnboarding } from '@/app/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowRight, PackageCheck } from "lucide-react";

const STEPS = ["Start", "Setup", "Track"];

export default async function WebOnboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  const { data: profile } = await supabase.from('profiles').select('onboarding_completed, path_type').eq('id', user.id).single()
  
  if (profile?.path_type === 'app') {
    return redirect('/app/dashboard')
  }

  if (profile?.onboarding_completed) {
    return redirect('/web/dashboard')
  }

  return (
    <div className="page-container pb-8">
      <header className="flex items-center justify-center py-2">
        <Image src="/logo.png" alt="OxiSure Tech" width={320} height={96} className="h-24 w-auto" />
      </header>

      <StepIndicator steps={STEPS} currentStep={1} />

      {errorMsg && (
        <div className="mb-6 p-4 rounded-[var(--radius-md)] bg-red-50 border border-red-200 text-red-600 text-sm">
          <p className="font-semibold mb-1">Failed to save profile</p>
          <p>{errorMsg}</p>
        </div>
      )}

      <section className="mb-4 animate-fade-up">
        <h1 className="text-xl font-bold text-[var(--color-text)] mb-2">
          Personalize Your Tracker
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Tell us about your oxygen usage so we can optimize your replacement alerts.
        </p>
      </section>

      <Card bordered className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
            <PackageCheck size={24} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--color-text)]">Standard Oxygen Tubing</p>
            <p className="text-xs text-[var(--color-text-muted)]">30-day lifecycle tracking</p>
          </div>
        </div>

        <form action={submitWebOnboarding} className="space-y-5">
          <input type="hidden" name="userType" value="self" />
          
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              How many tubes do you use per cycle?
            </label>
            <div className="relative">
              <select 
                name="quantity" 
                className="w-full appearance-none bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-3 rounded-[var(--radius-md)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
                defaultValue="1"
              >
                <option value="1">1 Tube</option>
                <option value="2">2 Tubes</option>
                <option value="3">3 Tubes</option>
                <option value="4">4+ Tubes</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[var(--color-text-muted)]">
                <ArrowRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>
          
          <Button type="submit" variant="primary" fullWidth size="lg" icon={<ArrowRight size={20} />}>
            Finalize Tracker
          </Button>
        </form>
      </Card>

      <p className="text-center text-xs text-[var(--color-text-muted)] mt-auto pt-4">
        By finalizing, you agree to our terms of service for tracker automation.
      </p>
    </div>
  )
}
