"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Clock, Bell, PackageCheck, ArrowRight, Smartphone, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="border-b border-[#E2E8F0] bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Image src="/logo.png" alt="OxiSureTech" width={160} height={48} className="h-10 w-auto" />
          <div className="flex items-center gap-3">
            <Link
              href="/web/start"
              className="text-sm font-semibold text-[#1B365D] hover:text-[#0EA5E9] transition-colors px-4 py-2 rounded-lg hover:bg-[#F1F5F9] min-h-0"
            >
              Sign In
            </Link>
            <Link
              href="/web/start"
              className="text-sm font-semibold text-white bg-[#1B365D] hover:bg-[#2A4A7F] transition-colors px-5 py-2.5 rounded-xl min-h-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0F9FF] via-white to-[#F8FAFC]"></div>
        <div className="absolute top-20 -right-32 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-100/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#1B365D]/5 border border-[#1B365D]/10 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-[#1B365D] tracking-wide">Oxygen Supply Tracker</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight">
                Your Tubing.<br />
                Always Fresh.<br />
                <span className="text-[#0EA5E9]">Never Forgotten.</span>
              </h1>

              <p className="text-lg text-[#64748B] max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8">
                Track your oxygen tubing replacement schedule and reorder at the right time — automatically.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-10">
                <Link
                  href="/app/login"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#1B365D] hover:bg-[#2A4A7F] text-white font-semibold rounded-xl shadow-lg shadow-[#1B365D]/20 hover:shadow-xl transition-all hover:scale-[1.02] min-h-0 text-sm"
                >
                  <Smartphone size={18} />
                  Download the App
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/web/start"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white hover:bg-[#F8FAFC] text-[#1B365D] font-semibold rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-sm hover:shadow transition-all hover:scale-[1.02] min-h-0 text-sm"
                >
                  <Globe size={18} />
                  Use Web Tracker
                </Link>
              </div>
            </div>

            {/* Right: Product visual */}
            <div className="shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/20 to-[#1B365D]/10 rounded-3xl blur-2xl scale-110"></div>
                <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-3xl bg-white border border-[#E2E8F0] shadow-2xl flex items-center justify-center overflow-hidden">
                  <Image
                    src="/product-tubing.png"
                    alt="Oxygen tubing"
                    width={200}
                    height={200}
                    className="object-contain p-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-3">Why OxiSureTech?</h2>
          <p className="text-[#64748B] max-w-md mx-auto">
            Everything you need to stay on top of your oxygen supply — in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Clock, title: "Smart Tracking", desc: "Know exactly when it's time to replace your tubing", color: "bg-blue-50 text-blue-600" },
            { icon: Bell, title: "Timely Reminders", desc: "Get push & email alerts before you run low", color: "bg-amber-50 text-amber-600" },
            { icon: PackageCheck, title: "Easy Reorder", desc: "Reorder in one tap with exclusive savings", color: "bg-emerald-50 text-emerald-600" },
            { icon: Shield, title: "Trusted", desc: "Used by oxygen therapy patients nationwide", color: "bg-violet-50 text-violet-600" },
          ].map((item) => (
            <div
              key={item.title}
              className="group p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon size={22} />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] mb-1.5">{item.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-gradient-to-r from-[#0f172a] via-[#1B365D] to-[#0f172a] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#ffffff' }}>Ready to start tracking?</h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Set up your personalized replacement tracker in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              href="/app/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#1B365D] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] min-h-0 text-sm"
            >
              <Smartphone size={18} />
              Download App
            </Link>
            <Link
              href="/web/start"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 font-semibold rounded-xl transition-all hover:scale-[1.02] min-h-0 text-sm"
              style={{ color: '#ffffff' }}
            >
              <Globe size={18} />
              Use Web Tracker
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="OxiSureTech" width={120} height={36} className="h-8 w-auto" />
          </div>
          <p className="text-xs text-[#94A3B8]">© 2026 OxiSure Tech Solutions. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
            <a href="https://oxisuretechsolutions.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1B365D] transition-colors">Website</a>
            <a href="mailto:support@oxisuretechsolutions.com" className="hover:text-[#1B365D] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
