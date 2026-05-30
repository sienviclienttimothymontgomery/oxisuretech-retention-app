import LoginForm from '@/components/login-form'
import Link from 'next/link'
import { Clock, Bell, PackageCheck, Shield } from 'lucide-react'

export default function WebStart() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Left: Hero / Branding Panel ── */}
      <div className="relative lg:w-[55%] bg-gradient-to-br from-[#0B1120] via-[#152244] to-[#0f172a] text-white overflow-hidden">
        {/* Decorative blurs */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-center min-h-full px-8 py-14 lg:px-16 xl:px-20">
          {/* Branding */}
          <div className="mb-12">
            <p className="text-2xl font-bold tracking-tight" style={{ color: '#ffffff' }}>OxiSureTech</p>
          </div>

          {/* Hero text */}
          <div className="mb-12">
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.15] mb-5 tracking-tight" style={{ color: '#ffffff' }}>
              Your Tubing.<br />
              Always Fresh.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">Never Forgotten.</span>
            </h1>
            <p className="text-base lg:text-lg max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Track your oxygen tubing replacement schedule and reorder at the right time — automatically.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3.5">
            {[
              { icon: Clock, text: 'Know exactly when to replace your tubing' },
              { icon: Bell, text: 'Get reminders before you run low' },
              { icon: PackageCheck, text: 'Reorder in one tap with exclusive savings' },
              { icon: Shield, text: 'Trusted by oxygen therapy users nationwide' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/15 shrink-0">
                  <item.icon size={18} className="text-cyan-300" />
                </div>
                <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Login Panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12 lg:px-12 xl:px-16">
        <div className="w-full max-w-[420px]">
          {/* Mobile-only logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="OxiSure Tech" className="h-14 w-auto" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="OxiSureTech" className="h-9 w-auto" />
              <span className="text-xs font-bold text-[#0EA5E9] uppercase tracking-[0.15em]">OxiSureTech</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0F172A] mb-2">Welcome back</h2>
            <p className="text-[#64748B] text-sm leading-relaxed">
              Sign in with your existing account or use a magic link to access your tracker dashboard.
            </p>
          </div>

          {/* Login Form */}
          <LoginForm type="web" />

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-center text-sm">
              <Link
                href="/"
                className="text-[#94A3B8] hover:text-[#1B365D] transition-colors font-medium"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
