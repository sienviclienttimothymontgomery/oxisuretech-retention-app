import React from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShoppingCart, ChevronRight, Bell, Calendar, Package, RefreshCw, AlertTriangle, CheckCircle2, Clock, History, Settings, LogOut, Users, HeartHandshake, UserPlus, Trash2, Plus, RotateCcw, Share2, ClipboardCopy, FileText, Heart } from "lucide-react";
import { addDependent, markDependentReplaced, deleteDependent } from '@/app/actions';
import { buildCartUrl, getDiscountTier, SHOPIFY_CONFIG } from '@/utils/shopify';
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
  console.log('[Dashboard] 🏁 Starting server component render...')
  const resolvedParams = await searchParams;
  const supabase = await createClient()
  
  console.log('[Dashboard] 🔑 Fetching active user from Supabase...')
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[Dashboard] 👤 Active user result:', user ? user.email : 'No active session')
  
  if (!user) {
    console.log('[Dashboard] 🛑 No user found, redirecting to /web/start')
    return redirect('/web/start')
  }

  console.log(`[Dashboard] 📦 Fetching user profile from db for UUID: ${user.id}...`)
  const { data: profile, error: profileError } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  console.log('[Dashboard] 📄 Profile fetch result:', {
    found: !!profile,
    error: profileError?.message || null,
    onboarding_completed: profile?.onboarding_completed,
    order_verified: profile?.order_verified,
    path_type: profile?.path_type,
  })

  // If no profile exists at all (e.g. database trigger didn't fire),
  // create one and send to onboarding instead of the order verification page
  if (!profile) {
    console.log('[Dashboard] ⚠️ No profile row found — creating one and redirecting to /web/onboarding')
    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      auth_provider: user.app_metadata?.provider || 'email',
      path_type: 'web',
    })
    return redirect('/web/onboarding')
  }

  const isAdmin = profile?.is_admin === true;

  if (!profile.onboarding_completed && !profile.order_verified) {
    console.log('[Dashboard] 🚨 Profile incomplete (onboarding_completed=false, order_verified=false), redirecting to /activate')
    return redirect('/activate')
  }
  if (!profile.onboarding_completed) {
    console.log('[Dashboard] 📋 Onboarding incomplete, redirecting to /web/onboarding')
    return redirect('/web/onboarding')
  }

  const quantity = profile?.quantity ?? 1;
  const trackerAnchor = profile?.tracker_started_at ?? profile?.created_at ?? null;
  const { daysLeft, reorderDays, elapsed, cycleNumber } = computeTimeLeft(trackerAnchor, quantity);
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
  if (trackerAnchor) {
    const startDate = new Date(trackerAnchor);
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
  const reorderTier = getDiscountTier(reorderDays);
  const cartUrl = buildCartUrl(quantity, reorderDays, 'web');
  const isCaregiver = profile?.user_type === 'caregiver';
  const activeView = isCaregiver && resolvedParams.view === 'caregiver' ? 'caregiver' : 'self';

  // ── Fetch dependents for caregiver view ──
  type Dependent = {
    id: string;
    name: string;
    product_sku: string | null;
    quantity: number | null;
    last_replaced_at: string | null;
    notes: string | null;
    created_at: string | null;
  };
  let dependents: Dependent[] = [];
  if (isCaregiver) {
    const { data } = await supabase
      .from('dependents')
      .select('*')
      .eq('caregiver_id', user.id)
      .order('created_at', { ascending: true });
    dependents = (data as Dependent[]) || [];
  }

  // Helper: compute days left for a dependent
  function getDependentStatus(lastReplaced: string | null) {
    if (!lastReplaced) return { daysLeft: 0, progress: 100, color: 'red' as const, label: 'Replace Now' };
    const elapsed = Math.max(0, Date.now() - new Date(lastReplaced).getTime());
    const dLeft = Math.max(0, BASE_CYCLE_DAYS - Math.floor(elapsed / 86400000));
    const prog = Math.max(0, Math.min(100, ((BASE_CYCLE_DAYS - dLeft) / BASE_CYCLE_DAYS) * 100));
    const col = dLeft > 7 ? 'emerald' as const : dLeft > 0 ? 'amber' as const : 'red' as const;
    const lbl = dLeft > 7 ? 'On Track' : dLeft > 0 ? 'Due Soon' : 'Replace Now';
    return { daysLeft: dLeft, progress: prog, color: col, label: lbl };
  }

  // Sort by urgency: Replace Now → Due Soon → On Track
  const sortedDependents = [...dependents].sort((a, b) => getDependentStatus(a.last_replaced_at).daysLeft - getDependentStatus(b.last_replaced_at).daysLeft);
  const needsAttention = dependents.filter(d => getDependentStatus(d.last_replaced_at).daysLeft <= 7).length;
  const urgentDeps = dependents.filter(d => getDependentStatus(d.last_replaced_at).daysLeft <= 3);
  const lowSupplyCount = dependents.filter(d => getDependentStatus(d.last_replaced_at).daysLeft <= 14).length;

  // ── Conflict Detection & Priority Resolution ──
  type ConflictGroup = {
    entries: { id: string; name: string; daysLeft: number }[];
    suggestedBatchDate: string;
  };

  function detectScheduleConflicts(deps: Dependent[], windowDays: number = 3): ConflictGroup[] {
    if (deps.length < 2) return [];
    const entries = deps.map(d => ({
      id: d.id, name: d.name,
      daysLeft: getDependentStatus(d.last_replaced_at).daysLeft,
    })).sort((a, b) => a.daysLeft - b.daysLeft);

    const groups: ConflictGroup[] = [];
    let current: typeof entries = [entries[0]];

    for (let i = 1; i < entries.length; i++) {
      if (entries[i].daysLeft - current[current.length - 1].daysLeft <= windowDays) {
        current.push(entries[i]);
      } else {
        if (current.length > 1) {
          const avg = Math.round(current.reduce((s, e) => s + e.daysLeft, 0) / current.length);
          const d = new Date(); d.setDate(d.getDate() + avg);
          groups.push({ entries: [...current], suggestedBatchDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
        }
        current = [entries[i]];
      }
    }
    if (current.length > 1) {
      const avg = Math.round(current.reduce((s, e) => s + e.daysLeft, 0) / current.length);
      const d = new Date(); d.setDate(d.getDate() + avg);
      groups.push({ entries: [...current], suggestedBatchDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    return groups;
  }

  type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
  function getPriorityLevel(daysLeft: number): PriorityLevel {
    if (daysLeft <= 0) return 'critical';
    if (daysLeft <= 3) return 'high';
    if (daysLeft <= 7) return 'medium';
    return 'low';
  }
  const PRIORITY_CFG: Record<PriorityLevel, { color: string; bg: string; border: string; label: string }> = {
    critical: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', label: 'P0' },
    high:     { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', label: 'P1' },
    medium:   { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: 'P2' },
    low:      { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'P3' },
  };

  const conflicts = detectScheduleConflicts(dependents);

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
              <p className="text-xs text-amber-600">Your full supply of {quantity} tube{quantity > 1 ? 's' : ''} runs out on <strong>{formatDate(supplyEnd)}</strong> ({reorderDays} days). Use code <strong>{reorderTier.code}</strong> for {reorderTier.percent}% off.</p>
            </div>
            <a
              href={cartUrl}
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
              href={cartUrl}
              target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0F172A]">Reorder Supplies</p>
                <p className="text-xs text-[#94A3B8]">Save {reorderTier.percent}% with code {reorderTier.code}</p>
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
                  ['Tracking since', trackerAnchor ? new Date(trackerAnchor).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'],
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
          /* ── Caregiver View: Full Management ── */
          <div className="max-w-4xl">
            {/* Caregiver Greeting + Share */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-rose-500" />
                <h2 className="text-lg font-extrabold text-[#0F172A]">Managing {dependents.length} {dependents.length === 1 ? 'person' : 'people'}</h2>
              </div>
              {dependents.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const lines = sortedDependents.map(d => {
                      const ds = getDependentStatus(d.last_replaced_at);
                      const next = new Date(); next.setDate(next.getDate() + ds.daysLeft);
                      return `• ${d.name} — ${ds.label} (${ds.daysLeft} days left, next due ${next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
                    });
                    const msg = `OxiSure Caregiver Summary\n${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n${lines.join('\n')}\n\nManaging ${dependents.length} ${dependents.length === 1 ? 'person' : 'people'}`;
                    navigator.clipboard?.writeText(msg);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-xs font-semibold text-[#0C5A8A] hover:bg-[#E0F2FE] transition-colors"
                >
                  <ClipboardCopy size={13} />
                  Copy Summary
                </button>
              )}
            </div>

            {/* Urgent Alert Banner */}
            {urgentDeps.length > 0 && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-5">
                <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 mb-0.5">Immediate attention needed</p>
                  <p className="text-xs text-red-600">{urgentDeps.map(d => d.name).join(', ')} — tubing overdue or due within 3 days</p>
                </div>
              </div>
            )}

            {/* Scheduling Conflict Detection */}
            {conflicts.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⚡</span>
                  <h3 className="text-sm font-bold text-amber-900">Scheduling Overlaps Detected</h3>
                </div>
                {conflicts.map((group, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-200 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900">{group.entries.map(e => e.name).join(' & ')}</p>
                      <p className="text-xs text-amber-600">Due within {Math.abs(group.entries[group.entries.length - 1].daysLeft - group.entries[0].daysLeft)} days of each other</p>
                    </div>
                    <div className="text-center bg-amber-100 rounded-lg px-3 py-1.5 shrink-0">
                      <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Batch on</p>
                      <p className="text-xs font-bold text-amber-900">{group.suggestedBatchDate}</p>
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-amber-600 mt-1">💡 Replace these together to simplify your schedule</p>
              </div>
            )}

            {/* Bulk Reorder CTA */}
            {lowSupplyCount > 0 && (
              <a href={buildCartUrl(lowSupplyCount, Math.min(...dependents.map(d => getDependentStatus(d.last_replaced_at).daysLeft)), 'web')} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] mb-5 hover:opacity-95 transition-opacity shadow-sm">
                <Package size={20} className="text-white shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">{lowSupplyCount} {lowSupplyCount === 1 ? 'person needs' : 'people need'} supplies soon</p>
                  <p className="text-xs text-white/80">Order replacement tubing for everyone →</p>
                </div>
              </a>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">People</span>
                </div>
                <p className="text-3xl font-extrabold text-[#0F172A] tabular-nums">{dependents.length}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">On Track</span>
                </div>
                <p className="text-3xl font-extrabold text-[#0F172A] tabular-nums">{dependents.length - needsAttention}</p>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${needsAttention > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    <AlertTriangle size={18} className={needsAttention > 0 ? 'text-amber-600' : 'text-slate-400'} />
                  </div>
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Needs Attention</span>
                </div>
                <p className={`text-3xl font-extrabold tabular-nums ${needsAttention > 0 ? 'text-amber-600' : 'text-[#0F172A]'}`}>{needsAttention}</p>
              </div>
            </div>

            {/* Dependent Cards */}
            {sortedDependents.length > 0 ? (
              <div className="space-y-4 mb-6">
                {sortedDependents.map((dep) => {
                  const ds = getDependentStatus(dep.last_replaced_at);
                  const ringColor = ds.color === 'emerald' ? '#10b981' : ds.color === 'amber' ? '#f59e0b' : '#ef4444';
                  const nextSwapDate = new Date();
                  nextSwapDate.setDate(nextSwapDate.getDate() + ds.daysLeft);
                  const badgeCls = ds.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : ds.color === 'amber'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200';

                  return (
                    <div key={dep.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row items-stretch">
                        {/* Left: Mini ring + info */}
                        <div className="flex items-center gap-5 p-5 sm:p-6 flex-1">
                          {/* Mini progress ring */}
                          <div className="relative w-16 h-16 shrink-0">
                            <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
                              <circle cx="30" cy="30" r="25" fill="none" stroke="#F1F5F9" strokeWidth="4" />
                              <circle cx="30" cy="30" r="25" fill="none" stroke={ringColor} strokeWidth="4" strokeLinecap="round"
                                strokeDasharray={`${(1 - ds.progress / 100) * 157} 157`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-lg font-extrabold text-[#0F172A] leading-none">{ds.daysLeft}</span>
                              <span className="text-[9px] text-[#94A3B8]">days</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-[#0F172A] truncate">{dep.name}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeCls}`}>{ds.label}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].bg} ${PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].border} ${PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].color}`}>{PRIORITY_CFG[getPriorityLevel(ds.daysLeft)].label}</span>
                              {dep.notes && dep.notes.trim() !== '' && (
                                <span className="text-[10px] text-[#94A3B8]" title={dep.notes}>📝</span>
                              )}
                            </div>
                            <p className="text-xs text-[#94A3B8]">
                              {dep.product_sku || 'OXI-TUB-07'} · Qty: {dep.quantity || 1} · Next swap {formatDate(nextSwapDate)}
                            </p>
                            {dep.last_replaced_at && (
                              <p className="text-[11px] text-[#CBD5E1] mt-0.5">
                                Last replaced {new Date(dep.last_replaced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex sm:flex-col items-center gap-2 px-5 py-3 sm:py-5 sm:border-l border-t sm:border-t-0 border-[#F1F5F9] bg-[#FAFBFC]">
                          <form action={markDependentReplaced}>
                            <input type="hidden" name="dependent_id" value={dep.id} />
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                            >
                              <RotateCcw size={13} />
                              Replaced
                            </button>
                          </form>
                          <form action={deleteDependent}>
                            <input type="hidden" name="dependent_id" value={dep.id} />
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors whitespace-nowrap"
                            >
                              <Trash2 size={13} />
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-10 text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-[#94A3B8]" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">No people added yet</h3>
                <p className="text-sm text-[#94A3B8] max-w-sm mx-auto">Add family members or patients below to start tracking their tubing replacement schedules.</p>
              </div>
            )}

            {/* Add Person Form */}
            <div className="bg-white rounded-2xl border-2 border-dashed border-[#E2E8F0] shadow-sm overflow-hidden">
              <form action={addDependent}>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Plus size={18} className="text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0F172A]">Add a Person</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. Mom, John"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Product</label>
                      <select
                        name="product_sku"
                        defaultValue="OXI-TUB-07"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                      >
                        <option value="OXI-TUB-07">Standard Tubing (7ft)</option>
                        <option value="OXI-TUB-25">Extended Tubing (25ft)</option>
                        <option value="OXI-TUB-50">Premium Tubing (50ft)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        defaultValue={1}
                        min={1}
                        max={12}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-5 sm:px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0]">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1B365D] text-white text-sm font-bold rounded-xl hover:bg-[#152244] transition-colors shadow-sm"
                  >
                    <UserPlus size={15} />
                    Add Person
                  </button>
                </div>
              </form>
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
