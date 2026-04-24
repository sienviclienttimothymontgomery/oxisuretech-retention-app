import React from "react";
import Image from "next/image";
import Link from "next/link";
import Button from '@/components/ui/Button'
import Card from "@/components/ui/Card";
import { updateWebSettings } from '@/app/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, PackageCheck, Save } from "lucide-react";

export default async function WebSettings({ searchParams }: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;
  const successMsg = resolvedParams.success;
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  
  if (profile?.path_type === 'app') {
    return redirect('/app/dashboard')
  }

  return (
    <div className="page-container pb-8">
      <header className="flex items-center py-4 mb-6 relative">
        <Link href="/web/dashboard" className="absolute left-0 p-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-bg-muted)]">
          <ArrowLeft size={24} />
        </Link>
        <div className="w-full flex justify-center">
          <Image src="/logo.png" alt="OxiSure Tech" width={240} height={72} className="h-16 md:h-20 w-auto" />
        </div>
      </header>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-[var(--radius-md)] bg-red-50 border border-red-200 text-red-600 text-sm">
          <p className="font-semibold mb-1">Failed to update settings</p>
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-[var(--radius-md)] bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <PackageCheck size={18} className="text-emerald-600" />
          <p className="font-medium">Settings updated successfully</p>
        </div>
      )}

      <section className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Tracker Settings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Update your oxygen usage to recalibrate your replacement alerts.
        </p>
      </section>

      <Card bordered className="mb-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--color-border-subtle)]">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0 border border-[var(--color-primary)]/20">
            <PackageCheck size={28} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--color-text)] text-lg">Standard Tubing</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">30-day lifecycle tracking</p>
          </div>
        </div>

        <form action={updateWebSettings} className="space-y-6">
          <input type="hidden" name="userType" value="self" />
          
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text)] mb-3">
              How many tubes do you use per cycle?
            </label>
            <div className="relative">
              <select 
                name="quantity" 
                className="w-full appearance-none bg-[var(--color-bg-muted)] border border-[var(--color-border)] p-4 rounded-xl text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 font-medium"
                defaultValue={profile?.quantity?.toString() || "1"}
              >
                <option value="1">1 Tube</option>
                <option value="2">2 Tubes</option>
                <option value="3">3 Tubes</option>
                <option value="4">4+ Tubes</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[var(--color-text-muted)]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <Button type="submit" variant="primary" fullWidth size="lg" icon={<Save size={20} />} className="mt-4 shadow-lg shadow-[var(--color-primary)]/20">
            Save Settings
          </Button>
        </form>
      </Card>
    </div>
  )
}
