import React from "react";
import Image from "next/image";
import Link from "next/link";
import { updateWebSettings, submitNotifications } from '@/app/actions'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, PackageCheck, Save, Bell, Mail, Smartphone, Check, Lock, User, AlertOctagon, Edit3, ChevronRight } from "lucide-react";
import UserMenu from "@/components/user-menu";
import DeleteAccountButton from "@/components/delete-account-button";

export default async function WebSettings({ searchParams }: { searchParams: Promise<{ error?: string, success?: string }> }) {
  const resolvedParams = await searchParams;
  const errorMsg = resolvedParams.error;
  const successMsg = resolvedParams.success;
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/web/start')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const isAdmin = profile?.is_admin === true;

  const rawName = user.email?.split('@')[0] || 'User';
  const displayName = rawName
    .replace(/[._-]/g, ' ')
    .replace(/\d+$/g, '')
    .trim()
    .split(' ')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'User';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between h-14 px-6 lg:px-10">
          <Link href="/web/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image src="/logo-icon.png" alt="OxiSureTech" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="text-base font-bold text-[#1B365D] tracking-tight hidden sm:inline">OxiSureTech</span>
          </Link>
          <UserMenu email={user.email || ''} displayName={displayName} isAdmin={isAdmin} />
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 px-6 md:px-8 py-8 lg:py-10">
        <div className="max-w-6xl mx-auto w-full">
          {/* Back + Title */}
          <div className="mb-8">
            <Link href="/web/dashboard" className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-[#1B365D] transition-colors mb-4">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-1">Settings</h1>
            <p className="text-sm text-[#64748B]">Manage your tracker, notifications, and account.</p>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <p className="font-semibold mb-0.5">Failed to update settings</p>
              <p>{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
              <PackageCheck size={18} className="text-emerald-600 shrink-0" />
              <p className="font-medium">Settings updated successfully</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start w-full mb-6">
            {/* Left: Tracker Settings */}
            <div className="lg:col-span-3 space-y-5">
            {/* Tracker Configuration */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-5">Tracker Configuration</h2>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#F1F5F9]">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <PackageCheck size={22} className="text-blue-500" />
                </div>
                <div>
                  <p className="font-bold text-[#0F172A]">Standard Tubing</p>
                  <p className="text-xs text-[#94A3B8]">{profile?.product_sku || 'OXI-TUB-07'}</p>
                </div>
              </div>

              <form action={updateWebSettings} className="space-y-5">
                <input type="hidden" name="userType" value="self" />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Tubes per cycle
                    </label>
                    <div className="relative">
                      <select 
                        name="quantity" 
                        className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-medium text-sm"
                        defaultValue={profile?.quantity?.toString() || "1"}
                      >
                        <option value="1">1 Tube</option>
                        <option value="2">2 Tubes</option>
                        <option value="3">3 Tubes</option>
                        <option value="4">4+ Tubes</option>
                      </select>
                      <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] rotate-90 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                      Cycle duration
                    </label>
                    <div className="relative">
                      <select 
                        name="cycle_duration" 
                        className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-medium text-sm"
                        defaultValue="30"
                      >
                        <option value="15">15 days</option>
                        <option value="30">30 days (Recommended)</option>
                        <option value="45">45 days</option>
                        <option value="60">60 days</option>
                      </select>
                      <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] rotate-90 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B365D] text-white font-semibold text-sm rounded-xl hover:bg-[#2A4A7F] transition-all shadow-sm min-h-0"
                >
                  <Check size={16} />
                  Save Changes
                </button>
              </form>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#0F172A] mb-5">Notifications</h2>
              <form action={async (formData) => {
                'use server';
                const push = formData.get('push') === 'on';
                const email = formData.get('email') === 'on';
                await submitNotifications(push, email, false);
              }} className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Smartphone size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">Push Notifications</p>
                      <p className="text-xs text-[#94A3B8]">Reminders on your device</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select 
                      name="push" 
                      className={`appearance-none font-bold text-xs px-3 py-1.5 rounded-full pr-8 border-none focus:ring-0 ${profile?.notifications_push ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                      defaultValue={profile?.notifications_push ? 'on' : 'off'}
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                    <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-50 rotate-90 pointer-events-none" size={12} />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">Email Notifications</p>
                      <p className="text-xs text-[#94A3B8]">Alerts to your inbox</p>
                    </div>
                  </div>
                  <div className="relative">
                    <select 
                      name="email" 
                      className={`appearance-none font-bold text-xs px-3 py-1.5 rounded-full pr-8 border-none focus:ring-0 ${profile?.notifications_email ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                      defaultValue={profile?.notifications_email ? 'on' : 'off'}
                    >
                      <option value="on">On</option>
                      <option value="off">Off</option>
                    </select>
                    <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-50 rotate-90 pointer-events-none" size={12} />
                  </div>
                </div>
                <div className="pt-2 border-t border-[#F1F5F9] mt-2">
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Alert Timing
                  </label>
                  <div className="relative mb-5">
                    <select 
                      name="alert_timing" 
                      className="w-full appearance-none bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-medium text-sm"
                      defaultValue="3"
                    >
                      <option value="7">7 days before swap</option>
                      <option value="3">3 days before swap (Default)</option>
                      <option value="1">1 day before swap</option>
                      <option value="0">On the day of swap</option>
                    </select>
                    <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] rotate-90 pointer-events-none" size={16} />
                  </div>
                  <button 
                    type="submit" 
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B365D] text-white font-semibold text-sm rounded-xl hover:bg-[#2A4A7F] transition-all shadow-sm min-h-0"
                  >
                    <Check size={16} />
                    Save Preferences
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Account Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Account Info */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
            <h2 className="text-sm font-bold text-[#0F172A] mb-5">Account</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B365D] to-[#2A4A7F] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-xl font-bold text-white leading-none" style={{ marginTop: '1px' }}>
                    {(displayName[0] || 'U').toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#0F172A] truncate">{displayName}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button type="button" className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Edit3 size={14} className="text-[#64748B]" />
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">Edit Profile</span>
                  </div>
                  <ChevronRight size={16} className="text-[#CBD5E1]" />
                </button>
                <button type="button" className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Lock size={14} className="text-[#64748B]" />
                    </div>
                    <span className="text-sm font-semibold text-[#0F172A]">Change Password</span>
                  </div>
                  <ChevronRight size={16} className="text-[#CBD5E1]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone (Full Width below grid) */}
        <DeleteAccountButton />
      </div>
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
