"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Shield, Clock, Bell, PackageCheck, ArrowRight, Smartphone, Globe, ChevronLeft, ChevronRight } from "lucide-react";

const carouselSlides = [
  { src: "/product-tubing.png", alt: "OxiSureTech Premium Oxygen Tubing", label: "Premium Tubing" },
  { src: "/carousel-tubing.png", alt: "Green Oxygen Tubing Coil", label: "Tubing Coil" },
  { src: "/carousel-flow.png", alt: "Six-Channel Flow System", label: "Flow System" },
  { src: "/carousel-connector.png", alt: "Anti-Tangle Swivel Connector", label: "Swivel Connector" },
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setResetKey((k) => k + 1);
  }, []);

  const handlePrev = useCallback(() => {
    prevSlide();
    setResetKey((k) => k + 1);
  }, [prevSlide]);

  const handleNext = useCallback(() => {
    nextSlide();
    setResetKey((k) => k + 1);
  }, [nextSlide]);

  // Always auto-play — resets timer after manual clicks
  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide, resetKey]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="border-b border-[#E2E8F0] bg-white/90 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#1B365D] group-hover:opacity-90 transition-opacity">
              OxiSure<span className="text-[#0EA5E9]">Tech</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/web/start"
              className="text-sm font-bold text-[#1B365D] hover:text-[#0EA5E9] transition-colors px-4 py-2.5 rounded-xl hover:bg-[#F1F5F9] min-h-0"
            >
              Sign In
            </Link>
            <Link
              href="/web/start"
              className="text-sm font-bold text-white bg-[#1B365D] hover:bg-[#2A4A7F] transition-colors px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] min-h-0"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden pt-2 pb-12 lg:pt-4 lg:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F0F9FF] via-white to-[#F8FAFC]"></div>
        <div className="absolute top-20 -right-32 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-cyan-100/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-16 lg:pt-10 lg:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#1B365D]/5 border border-[#1B365D]/10 rounded-full mb-8">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-[#1B365D] tracking-wider uppercase">Oxygen Supply Tracker</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#0F172A] leading-[1.05] mb-8 tracking-tight">
                Your Tubing.<br />
                Always Fresh.<br />
                <span className="text-[#0EA5E9]">Never Forgotten.</span>
              </h1>

              <p className="text-xl text-[#475569] max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10">
                Track your oxygen tubing replacement schedule and reorder at the right time — automatically. Maximize convenience, safety, and savings.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link
                  href="/app/login"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-[#1B365D] hover:bg-[#2A4A7F] text-white font-bold rounded-2xl border-2 border-transparent shadow-xl shadow-[#1B365D]/20 hover:shadow-2xl transition-all hover:scale-[1.02] min-h-0 text-base"
                >
                  <Smartphone size={20} />
                  Download the App
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/web/start"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-[#F8FAFC] text-[#1B365D] font-bold rounded-2xl border-2 border-[#E2E8F0] hover:border-[#CBD5E1] shadow-sm hover:shadow transition-all hover:scale-[1.02] min-h-0 text-base"
                >
                  <Globe size={20} />
                  Use Web Tracker
                </Link>
              </div>
            </div>

            {/* Right: Product Carousel */}
            <div className="shrink-0 lg:w-1/2 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/25 to-[#1B365D]/15 rounded-[40px] blur-3xl scale-110"></div>
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-[40px] bg-white border-2 border-[#E2E8F0]/90 shadow-[0_30px_70px_-15px_rgba(27,54,93,0.16)] overflow-hidden transition-transform hover:scale-[1.02] duration-500">
                  {/* Carousel Images */}
                  {carouselSlides.map((slide, index) => (
                    <div
                      key={slide.src}
                      className="absolute inset-0 flex items-center justify-center p-6 transition-all duration-700 ease-in-out"
                      style={{
                        opacity: index === currentSlide ? 1 : 0,
                        transform: index === currentSlide ? 'scale(1)' : 'scale(0.95)',
                        zIndex: index === currentSlide ? 1 : 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}

                  {/* Navigation Arrows — always visible */}
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E2E8F0] shadow-lg flex items-center justify-center text-[#1B365D] hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-[#E2E8F0] shadow-lg flex items-center justify-center text-[#1B365D] hover:bg-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Slide Label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-[#1B365D]/80 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-bold text-white tracking-wide">{carouselSlides[currentSlide].label}</span>
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="flex items-center justify-center gap-2 mt-5">
                  {carouselSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentSlide
                          ? 'w-8 h-3 bg-[#0EA5E9]'
                          : 'w-3 h-3 bg-[#CBD5E1] hover:bg-[#94A3B8]'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-20 pb-32 lg:pt-24 lg:pb-40">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight mb-4">Why OxiSureTech?</h2>
          <p className="text-lg text-[#64748B] max-w-xl mx-auto">
            Everything you need to stay on top of your oxygen supply — in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Clock, title: "Smart Tracking", desc: "Know exactly when it's time to replace your tubing based on safety guidelines", color: "bg-blue-100/90 text-blue-700 border-2 border-blue-200" },
            { icon: Bell, title: "Timely Reminders", desc: "Get push & email alerts before you run low so you have a seamless supply", color: "bg-amber-100/90 text-amber-700 border-2 border-amber-200" },
            { icon: PackageCheck, title: "Easy Reorder", desc: "Reorder in one tap with exclusive, dynamic savings up to 20% off", color: "bg-emerald-100/90 text-emerald-700 border-2 border-emerald-200" },
            { icon: Shield, title: "Trusted Platform", desc: "Used by oxygen therapy patients and caregivers nationwide for ultimate peace of mind", color: "bg-violet-100/90 text-violet-700 border-2 border-violet-200" },
          ].map((item) => (
            <div
              key={item.title}
              className="group p-8 rounded-3xl bg-white border border-[#E2E8F0] hover:border-[#0EA5E9]/50 hover:shadow-[0_20px_45px_-12px_rgba(14,165,233,0.08)] hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] mb-3">{item.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="bg-gradient-to-r from-[#0f172a] via-[#1B365D] to-[#0f172a] text-white py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 tracking-tight" style={{ color: '#ffffff' }}>Ready to start tracking?</h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Set up your personalized replacement tracker in under a minute and protect your health today.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/app/login"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1B365D] font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] min-h-0 text-base"
            >
              <Smartphone size={20} />
              Download App
            </Link>
            <Link
              href="/web/start"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 font-bold rounded-2xl transition-all hover:scale-[1.02] min-h-0 text-base"
              style={{ color: '#ffffff' }}
            >
              <Globe size={20} />
              Use Web Tracker
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-xl font-black tracking-tight text-[#1B365D] group-hover:opacity-90 transition-opacity">
              OxiSure<span className="text-[#0EA5E9]">Tech</span>
            </span>
          </Link>
          <p className="text-sm text-[#94A3B8]">© 2026 OxiSure Tech Solutions. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm font-semibold text-[#94A3B8]">
            <a href="https://oxisuretechsolutions.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#1B365D] transition-colors">Website</a>
            <a href="mailto:support@oxisuretechsolutions.com" className="hover:text-[#1B365D] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
