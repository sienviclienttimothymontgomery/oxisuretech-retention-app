"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, LogOut, ChevronDown, User, ShieldCheck } from "lucide-react";

interface UserMenuProps {
  email: string;
  displayName: string;
  isAdmin?: boolean;
}

export default function UserMenu({ email, displayName, isAdmin }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initial = (displayName?.[0] || email?.[0] || "U").toUpperCase();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B365D] to-[#2A4A7F] flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-xs font-bold text-white leading-none" style={{ marginTop: '1px' }}>{initial}</span>
        </div>
        <span className="text-sm font-semibold text-[#0F172A] hidden sm:inline">{displayName}</span>
        <ChevronDown size={14} className={`text-[#94A3B8] hidden sm:inline transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-[#E2E8F0] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info */}
          <div className="p-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B365D] to-[#2A4A7F] flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white leading-none" style={{ marginTop: '1px' }}>{initial}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0F172A] truncate">{displayName}</p>
                <p className="text-xs text-[#94A3B8] truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            {isAdmin && (
              <Link
                href="/web/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#0F172A] hover:bg-blue-50 transition-colors"
              >
                <ShieldCheck size={16} className="text-blue-500" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            )}
            <Link
              href="/web/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <Settings size={16} className="text-[#94A3B8]" />
              <span className="font-medium">Settings</span>
            </Link>

            <div className="my-1 border-t border-[#F1F5F9]"></div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut size={16} />
                <span className="font-medium">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
