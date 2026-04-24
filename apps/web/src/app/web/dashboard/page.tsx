import React from "react";
import Image from "next/image";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Card from "@/components/ui/Card";
import { Activity, Calendar, Package, Settings, LogOut } from "lucide-react";

export default async function WebDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.path_type === 'app') {
    return redirect('/app/dashboard')
  }

  if (!profile?.onboarding_completed) {
    return redirect('/web/onboarding')
  }
    
  return (
    <div className="page-container pb-8">
      <header className="flex items-center justify-between py-4 mb-6">
        <Image src="/logo.png" alt="OxiSure Tech" width={180} height={54} className="h-12 w-auto" />
        <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
          <Settings size={22} />
        </button>
      </header>

      <section className="mb-6 animate-fade-up">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">
          Tracker Active
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Welcome back. Your replacement schedule is being monitored.
        </p>
      </section>

      {/* Main Status Card */}
      <Card bordered className="mb-5 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white border-none">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Activity size={20} className="text-[var(--color-accent-light)]" />
          </div>
          <span className="px-3 py-1 rounded-full bg-[var(--color-success)] text-[10px] font-bold uppercase tracking-wider">
            Healthy
          </span>
        </div>
        <p className="text-sm opacity-80 mb-1">Next Replacement In</p>
        <p className="text-4xl font-bold">29 Days</p>
        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs opacity-70">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>Target: May 20, 2026</span>
          </div>
          <div className="flex items-center gap-1">
            <Package size={14} />
            <span>{profile?.quantity || 1} Tube(s)</span>
          </div>
        </div>
      </Card>

      {/* Tracker Details */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-1">
          Tracker Details
        </h2>
        <Card bordered>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-[var(--color-text-secondary)]">Account</span>
              <span className="text-sm font-medium text-[var(--color-text)]">{user.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[var(--color-border-subtle)]">
              <span className="text-sm text-[var(--color-text-secondary)]">Workspace</span>
              <span className="text-sm font-medium text-[var(--color-text)] capitalize">{profile?.path_type || 'Web'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[var(--color-border-subtle)]">
              <span className="text-sm text-[var(--color-text-secondary)]">Product SKU</span>
              <span className="text-sm font-medium text-[var(--color-text)]">{profile?.product_sku || 'Standard Tubing'}</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Logout Action */}
      <div className="mt-auto pt-8">
        <form action="/auth/signout" method="post">
          <button type="submit" className="w-full flex items-center justify-center gap-2 text-sm font-medium text-[var(--color-danger)] py-3 hover:bg-[var(--color-danger-bg)] rounded-[var(--radius-md)] transition-colors">
            <LogOut size={18} />
            Sign Out of Tracker
          </button>
        </form>
      </div>
    </div>
  )
}
