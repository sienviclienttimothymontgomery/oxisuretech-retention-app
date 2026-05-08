import React from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShoppingCart, ChevronRight, Bell, Calendar, Package, RefreshCw, AlertTriangle, CheckCircle2, Clock, History, Settings, LogOut, Users, HeartHandshake, UserPlus } from "lucide-react";
import UserMenu from "@/components/user-menu";

const BASE_CYCLE_DAYS = 30;

function computeTimeLeft(createdAt: string | null, quantity: number = 1) {
  const qty = Math.max(1, quantity);
  const totalSupplyDays = BASE_CYCLE_DAYS * qty;
  if (!createdAt) return { daysLeft: BASE_CYCLE_DAYS, reorderDays: totalSupplyDays, elapsed: 0, cycleNumber: 1 };
  const elapsedMs = Math.max(0, Date.now() - new Date(createdAt).getTime());
  const elapsed = Math.floor(elapsedMs / 86400000);
  const totalCycleMs = totalSupplyDays * 86400000;
  const msLeftReorder = totalCycleMs - (elapsedMs % totalCycleMs);
  const reorderDays = Math.ceil(msLeftReorder / 86400000);
  const swapCycleMs = BASE_CYCLE_DAYS * 86400000;
  const msLeftSwap = swapCycleMs - (elapsedMs % swapCycleMs);
  const daysLeft = Math.ceil(msLeftSwap / 86400000);
  const cycleNumber = Math.floor(elapsed / BASE_CYCLE_DAYS) + 1;
  return { daysLeft, reorderDays, elapsed, cycleNumber };
}

function getStatus(daysLeft: number) {
  if (daysLeft > 7) return { color: 'emerald', label: 'On Track' };
  if (daysLeft > 3) return { color: 'amber', label: 'Due Soon' };
  if (daysLeft > 0) return { color: 'red', label: 'Replace Now' };
  return { color: 'red', label: 'Overdue' };
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default async function WebDashboard({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const resolvedParams = await searchParams;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const isAdmin = profile?.is_admin === true;

  if (!profile?.onboarding_completed && !profile?.order_verified) return redirect('/activate')
  if (!profile?.onboarding_completed) return redirect('/web/onboarding')

  const quantity = profile?.quantity ?? 1;
  const { daysLeft, reorderDays, elapsed, cycleNumber } = computeTimeLeft(profile?.created_at ?? null, quantity);
  const status = getStatus(daysLeft);
  const progress = Math.max(0, Math.min(100, ((BASE_CYCLE_DAYS - daysLeft) / BASE_CYCLE_DAYS) * 100));

  const now = new Date();
  const nextSwap = new Date(now); nextSwap.setDate(now.getDate() + daysLeft);
  const supplyEnd = new Date(now); supplyEnd.setDate(now.getDate() + reorderDays);

  // Calculate last swap date
  const lastSwap = new Date(now); lastSwap.setDate(now.getDate() - (BASE_CYCLE_DAYS - daysLeft));
  const lastSwapStr = formatDate(lastSwap);

  // Calculate reminder date (3 days before next swap)
  const reminderDate = new Date(nextSwap); reminderDate.setDate(reminderDate.getDate() - 3);
  const reminderStr = formatDate(reminderDate);

  const username = user.email?.split('@')[0] || 'there';
  // Derive a human-friendly display name from the email prefix
  const rawName = user.email?.split('@')[0] || 'User';
  const displayName = rawName
    .replace(/[._-]/g, ' ')
    .replace(/\d+$/g, '')
    .trim()
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'User';

  const ringColor = status.color === 'emerald' ? '#10b981' : status.color === 'amber' ? '#f59e0b' : '#ef4444';
  const badgeClass = status.color === 'emerald'
    ? 'bg-emerald-100 text-emerald-700'
    : status.color === 'amber'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-700';

  // Generate swap history (calculated from created_at)
  const swapHistory: { date: string; cycle: number; status: string }[] = [];
  if (profile?.created_at) {
    const startDate = new Date(profile.created_at);
    for (let c = 1; c < cycleNumber; c++) {
      const swapDate = new Date(startDate);
      swapDate.setDate(startDate.getDate() + (c * BASE_CYCLE_DAYS));
      swapHistory.push({
        date: formatDate(swapDate),
        cycle: c,
        status: 'Completed'
      });
    }
    swapHistory.reverse(); // most recent first
  }

  const supplyWarning = reorderDays <= 14;
  const isCaregiver = profile?.user_type === 'caregiver';
  const activeView = isCaregiver && resolvedParams.view === 'caregiver' ? 'caregiver' : 'self';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between h-14 px-6 lg:px-10">
          {/* Left: Icon + Brand */}
          <Link href="/web/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image src="/logo-icon.png" alt="OxiSureTech" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-base font-bold text-[#1B365D] tracking-tight hidden sm:inline">OxiSureTech</span>
          </Link>

          {/* Right: User dropdown */}
          <UserMenu email={user.email || ''} displayName={displayName} isAdmin={isAdmin} />
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 px-6 lg:px-10 py-8 lg:py-10">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Welcome back, {username} 👋</h1>
          <p className="text-sm text-[#64748B]">Cycle {cycleNumber} · {profile?.product_sku || 'OXI-TUB-07'} · {quantity} tube{quantity > 1 ? 's' : ''}</p>
        </div>

        {/* ── Caregiver Tab Toggle ── */}
        {isCaregiver && (
          <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl w-fit mb-8">
            <Link
              href="/web/dashboard"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'self'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Clock size={15} />
              My Tracker
            </Link>
            <Link
              href="/web/dashboard?view=caregiver"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeView === 'caregiver'
                  ? 'bg-white text-[#0F172A] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <HeartHandshake size={15} />
              People I Manage
            </Link>
          </div>
        )}

        {activeView === 'self' ? (<>
        {/* ── Tracker Hero ── */}
        <div className="bg-gradient-to-br from-[#0f172a] via-[#152244] to-[#1B365D] rounded-2xl p-8 lg:p-10 text-white shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Ring */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative w-44 h-44 lg:w-48 lg:h-48 mb-4">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke={ringColor} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${(1 - progress / 100) * 327} 327`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-extrabold tracking-tight">{daysLeft}</span>
                  <span className="text-sm text-slate-400">days left</span>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${badgeClass}`}>{status.label}</span>
            </div>

            {/* Key info + CTA */}
            <div className="flex-1 w-full">
              {/* Last / Next swap context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <History size={14} className="text-slate-400" />
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Last Replaced</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: '#fff' }}>{lastSwapStr}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{BASE_CYCLE_DAYS - daysLeft} days ago</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Next Swap</span>
                  </div>
                  <p className="text-lg font-bold" style={{ color: '#fff' }}>{formatDate(nextSwap)}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>in {daysLeft} days</p>
                </div>
              </div>

              {/* Mark as Replaced — the #1 action */}
              <form action="/web/dashboard" method="post">
                <button type="button" className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white text-[#0F172A] font-bold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]">
                  <RefreshCw size={18} />
                  Mark as Replaced Today
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Supply Warning (only when close) ── */}
        {supplyWarning && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">Supply running low</p>
              <p className="text-xs text-amber-600">Your full supply of {quantity} tube{quantity > 1 ? 's' : ''} runs out on <strong>{formatDate(supplyEnd)}</strong> ({reorderDays} days). Order now to avoid a gap.</p>
            </div>
            <a
              href="https://oxisuretechsolutions.com/products/oxygen-tubing-50-ft-non-kinking-high-flow-hose"
              target="_blank" rel="noopener noreferrer"
              className="shrink-0 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-all min-h-0"
            >
              Reorder Now
            </a>
          </div>
        )}

        {/* ── Two-column: Details + Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Left: Supply details */}
          <div className="lg:col-span-3 space-y-5">
            {/* Supply Status Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-4">Supply Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Cycle</p>
                  <p className="text-lg font-bold text-[#0F172A]">#{cycleNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Progress</p>
                  <p className="text-lg font-bold text-[#0F172A]">{Math.round(progress)}%</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Supply Ends</p>
                  <p className={`text-lg font-bold ${supplyWarning ? 'text-amber-600' : 'text-[#0F172A]'}`}>{formatDate(supplyEnd)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8] mb-1">Reorder In</p>
                  <p className={`text-lg font-bold ${supplyWarning ? 'text-amber-600' : 'text-[#0F172A]'}`}>{reorderDays} days</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${status.color === 'emerald' ? 'bg-emerald-500' : status.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-[#94A3B8]">
                  <span>Replaced {lastSwapStr}</span>
                  <span>Due {formatDate(nextSwap)}</span>
                </div>
              </div>
            </div>

            {/* Swap History */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#0F172A]">Swap History</h2>
                <span className="text-xs text-[#94A3B8]">{swapHistory.length + 1} total</span>
              </div>

              {/* Current cycle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Cycle #{cycleNumber} — In Progress</p>
                  <p className="text-xs text-blue-600">Started {lastSwapStr} · {daysLeft} days remaining</p>
                </div>
              </div>

              {/* Past swaps */}
              {swapHistory.length > 0 ? (
                <div className="space-y-1">
                  {swapHistory.slice(0, 5).map((swap) => (
                    <div key={swap.cycle} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#0F172A]">Cycle #{swap.cycle}</p>
                        <p className="text-xs text-[#94A3B8]">{swap.date}</p>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium">{swap.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#94A3B8] text-center py-4">This is your first cycle. History will appear after your first swap.</p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Alerts — specific */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-3">Upcoming Alerts</h2>
              <div className="space-y-2.5">
                {profile?.notifications_push || profile?.notifications_email ? (
                  <>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#F8FAFC]">
                      <Bell size={14} className="text-amber-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F172A]">Swap reminder</p>
                        <p className="text-[11px] text-[#94A3B8]">{reminderStr} (3 days before)</p>
                      </div>
                    </div>
                    {supplyWarning && (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-amber-800">Supply low</p>
                          <p className="text-[11px] text-amber-600">{formatDate(supplyEnd)}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-3">
                    <p className="text-xs text-[#94A3B8] mb-2">No alerts configured</p>
                    <Link href="/web/settings" className="text-xs font-semibold text-[#0EA5E9] hover:underline">Enable in Settings →</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <a
              href="https://oxisuretechsolutions.com/products/oxygen-tubing-50-ft-non-kinking-high-flow-hose"
              target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0F172A]">Reorder Supplies</p>
                <p className="text-xs text-[#94A3B8]">Order before you run out</p>
              </div>
              <ChevronRight size={16} className="text-[#CBD5E1] group-hover:translate-x-1 transition-transform shrink-0" />
            </a>

            <Link href="/web/settings" className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center shrink-0">
                <Settings size={18} className="text-[#64748B]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0F172A]">Tracker Settings</p>
                <p className="text-xs text-[#94A3B8]">Quantity, notifications & more</p>
              </div>
              <ChevronRight size={16} className="text-[#CBD5E1] group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>

            {/* Account */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-3">Account</h2>
              <div className="space-y-2">
                {[
                  ['Email', user.email || '—'],
                  ['Product', profile?.product_sku || 'OXI-TUB-07'],
                  ['Qty/cycle', `${quantity} tube${quantity > 1 ? 's' : ''}`],
                  ['Tracking since', profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-1">
                    <span className="text-xs text-[#94A3B8]">{label}</span>
                    <span className="text-xs font-semibold text-[#0F172A] truncate max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>) : (
          /* ── Caregiver View: Coming Soon ── */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {/* Hero illustration area */}
              <div className="bg-gradient-to-br from-[#0f172a] via-[#152244] to-[#1B365D] px-8 py-12 text-center relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5 backdrop-blur-sm">
                    <Users size={36} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Caregiver Management</h2>
                  <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                    Manage replacement schedules for your loved ones — all in one place.
                  </p>
                </div>
              </div>

              {/* Feature preview cards */}
              <div className="p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: UserPlus, title: 'Add People', desc: 'Track schedules for family members or patients', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: Bell, title: 'Smart Alerts', desc: 'Get reminders when their tubing needs replacing', color: 'text-violet-600', bg: 'bg-violet-50' },
                    { icon: ShoppingCart, title: 'Bulk Reorder', desc: 'One-tap ordering for everyone you manage', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  ].map((f) => (
                    <div key={f.title} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-3`}>
                        <f.icon size={20} className={f.color} />
                      </div>
                      <p className="text-sm font-bold text-[#0F172A] mb-1">{f.title}</p>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD]">
                    <span className="text-sm">🚀</span>
                    <span className="text-sm font-bold text-[#0C5A8A]">Coming Soon</span>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-3">We&apos;re building this feature right now. Stay tuned!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between px-6 lg:px-10 py-4 text-xs text-[#94A3B8]">
          <p>© 2026 OxiSure Tech Solutions</p>
          <div className="flex gap-4">
            <a href="https://oxisuretechsolutions.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1B365D] transition-colors">Website</a>
            <a href="mailto:support@oxisuretechsolutions.com" className="hover:text-[#1B365D] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
