import React from "react";
import Image from "next/image";
import Link from "next/link";
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

  // Force order verification before allowing them into the dashboard or onboarding
  if (!profile?.order_verified) {
    return redirect('/activate')
  }

  if (!profile?.onboarding_completed) {
    return redirect('/web/onboarding')
  }
    
  return (
    <div className="page-container pb-8">
      <header className="flex items-center justify-between py-4 mb-6">
        <Image src="/logo.png" alt="OxiSure Tech" width={240} height={72} className="h-16 md:h-20 w-auto" />
        <Link href="/web/settings" className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded-full hover:bg-[var(--color-bg-muted)]">
          <Settings size={24} />
        </Link>
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
      <Card bordered className="mb-6 relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white border-slate-700/50 shadow-xl shadow-slate-900/10">
        {/* Decorative background blur */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
              <Activity size={24} className="text-blue-400" />
            </div>
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Healthy
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Next Replacement In</p>
            <p className="text-5xl font-extrabold tracking-tight text-white drop-shadow-md">29 <span className="text-3xl text-slate-300 font-bold">Days</span></p>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Calendar size={16} className="text-slate-400" />
              <span className="font-medium">May 20, 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Package size={16} className="text-slate-400" />
              <span className="font-medium">{profile?.quantity || 1} Tube(s)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tracker Details */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-widest px-1">
          Tracker Details
        </h2>
        <Card bordered className="shadow-sm">
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">Account</span>
              <span className="text-sm font-semibold text-[var(--color-text)] truncate max-w-[200px]">{user.email}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-subtle)]">
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">Workspace</span>
              <span className="text-sm font-semibold text-[var(--color-text)] capitalize bg-[var(--color-bg-muted)] px-3 py-1 rounded-full">{profile?.path_type || 'Web'}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-[var(--color-border-subtle)]">
              <span className="text-sm text-[var(--color-text-secondary)] font-medium">Product SKU</span>
              <span className="text-sm font-semibold text-[var(--color-text)] bg-[var(--color-bg-muted)] px-3 py-1 rounded-full">{profile?.product_sku || 'Standard Tubing'}</span>
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
