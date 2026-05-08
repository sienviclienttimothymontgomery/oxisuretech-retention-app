import React from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Users,
  CheckCircle2,
  UserCircle,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import UserMenu from "@/components/user-menu";

type UserProfile = {
  id: string;
  user_type: string | null;
  product_sku: string | null;
  quantity: number | null;
  onboarding_completed: boolean | null;
  is_admin: boolean | null;
  created_at: string | null;
  email?: string;
  full_name?: string;
};

export const metadata = {
  title: "Admin Panel — OxiSure Tech",
  description: "Manage users and view analytics for OxiSure Tech.",
};

export default async function WebAdminDashboard() {
  const supabase = await createClient();

  // ── Auth gate ──
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/web/start");

  // ── Admin check ──
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin) {
    return redirect("/web/dashboard");
  }

  // ── Fetch all profiles ──
  const { data: allProfiles, error: fetchError } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  const users: UserProfile[] = (allProfiles as UserProfile[]) || [];
  const nonAdmin = users.filter((u) => !u.is_admin);
  const total = nonAdmin.length;
  const onboarded = nonAdmin.filter((u) => u.onboarding_completed).length;
  const selfUsers = users.filter((u) => u.user_type === "self").length;
  const caregiverUsers = users.filter((u) => u.user_type === "caregiver").length;

  // ── Display name ──
  const rawName = user.email?.split("@")[0] || "Admin";
  const displayName =
    rawName
      .replace(/[._-]/g, " ")
      .replace(/\d+$/g, "")
      .trim()
      .split(" ")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Admin";

  const stats = [
    {
      icon: Users,
      value: total,
      label: "Total Users",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      icon: CheckCircle2,
      value: onboarded,
      label: "Onboarded",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      icon: UserCircle,
      value: selfUsers,
      label: "Self Users",
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      icon: HeartHandshake,
      value: caregiverUsers,
      label: "Caregivers",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between h-14 px-6 lg:px-10">
          <Link
            href="/web/admin"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo-icon.png"
              alt="OxiSureTech"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="text-base font-bold text-[#1B365D] tracking-tight hidden sm:inline">
              OxiSureTech
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200">
              <ShieldCheck size={14} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700">Admin</span>
            </div>
            <UserMenu
              email={user.email || ""}
              displayName={displayName}
              isAdmin={true}
            />
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 px-6 lg:px-10 py-8 lg:py-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B365D] to-[#2A4A7F] flex items-center justify-center shadow-sm">
                  <ShieldCheck size={20} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#0F172A]">
                    Admin Panel
                  </h1>
                  <p className="text-sm text-[#64748B]">{user.email}</p>
                </div>
              </div>
          </div>
          </div>

          {/* ── Error / Warning Banners ── */}
          {fetchError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="text-red-500 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-red-700">
                  Database Error
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  {fetchError.message}
                </p>
              </div>
            </div>
          )}
          {!fetchError && users.length <= 1 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle
                size={18}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-amber-700">
                  Only {users.length} profile(s) returned
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  This usually means the admin RLS migration hasn&apos;t been
                  applied yet. Please run the SQL from the admin migration in
                  your Supabase SQL Editor.
                </p>
              </div>
            </div>
          )}

          {/* ── Stats Grid ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className={`bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}
                  >
                    <s.icon size={20} className={s.color} />
                  </div>
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    {s.label}
                  </span>
                </div>
                <p className="text-3xl font-extrabold text-[#0F172A] tabular-nums">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Users Section ── */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-[#0F172A]">
                  Registered Users
                </h2>
                <span className="text-xs font-semibold text-[#94A3B8] bg-[#F1F5F9] px-2.5 py-0.5 rounded-full">
                  {total}
                </span>
              </div>
              <Link
                href="/web/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-sm font-semibold text-[#0C5A8A] hover:bg-[#E0F2FE] transition-colors min-h-0"
              >
                <RefreshCw size={14} />
                Refresh
              </Link>
            </div>

            {nonAdmin.length === 0 ? (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-5">
                  <Inbox size={28} className="text-[#94A3B8]" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">
                  No Users Yet
                </h3>
                <p className="text-sm text-[#94A3B8] text-center max-w-sm">
                  Users will appear here once they sign up and complete
                  onboarding.
                </p>
              </div>
            ) : (
              <>
                {/* ── Desktop Table ── */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#F8FAFC]">
                        <th className="text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider px-6 py-3">
                          User
                        </th>
                        <th className="text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider px-4 py-3">
                          Type
                        </th>
                        <th className="text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider px-4 py-3">
                          Product
                        </th>
                        <th className="text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider px-4 py-3">
                          Qty
                        </th>
                        <th className="text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider px-4 py-3">
                          Status
                        </th>
                        <th className="text-left text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider px-6 py-3">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9]">
                      {nonAdmin.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-[#FAFBFC] transition-colors"
                        >
                          {/* User */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#0EA5E9] flex items-center justify-center shrink-0 shadow-sm">
                                <span className="text-sm font-bold text-white leading-none">
                                  {(
                                    u.full_name ||
                                    u.email ||
                                    u.id
                                  )
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#0F172A] truncate">
                                  {u.full_name ||
                                    u.email ||
                                    u.id.substring(0, 8)}
                                </p>
                                {u.email && (
                                  <p className="text-xs text-[#94A3B8] truncate">
                                    {u.email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          {/* Type */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                u.user_type === "caregiver"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : u.user_type === "self"
                                  ? "bg-violet-50 text-violet-700 border border-violet-200"
                                  : "bg-slate-50 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {u.user_type === "caregiver"
                                ? "🤝 Caregiver"
                                : u.user_type === "self"
                                ? "👤 Self"
                                : "—"}
                            </span>
                          </td>
                          {/* Product */}
                          <td className="px-4 py-4">
                            <span className="text-sm text-[#0F172A] font-medium">
                              {u.product_sku || "—"}
                            </span>
                          </td>
                          {/* Qty */}
                          <td className="px-4 py-4">
                            <span className="text-sm text-[#0F172A] font-medium tabular-nums">
                              {u.quantity ?? "—"}
                            </span>
                          </td>
                          {/* Status */}
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                u.onboarding_completed
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {u.onboarding_completed ? (
                                <>
                                  <CheckCircle2 size={12} />
                                  Active
                                </>
                              ) : (
                                "Pending"
                              )}
                            </span>
                          </td>
                          {/* Joined */}
                          <td className="px-6 py-4">
                            <span className="text-xs text-[#94A3B8]">
                              {u.created_at
                                ? new Date(u.created_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Mobile Cards ── */}
                <div className="lg:hidden divide-y divide-[#F1F5F9]">
                  {nonAdmin.map((u) => (
                    <div key={u.id} className="px-5 py-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#0EA5E9] flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-sm font-bold text-white leading-none">
                            {(u.full_name || u.email || u.id)
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0F172A] truncate">
                            {u.full_name || u.email || u.id.substring(0, 8)}
                          </p>
                          {u.email && (
                            <p className="text-xs text-[#94A3B8] truncate">
                              {u.email}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                            u.onboarding_completed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {u.onboarding_completed ? "Active" : "Pending"}
                        </span>
                      </div>
                      <div className="flex gap-4 bg-[#F8FAFC] rounded-xl px-4 py-3">
                        <div className="flex-1">
                          <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium mb-0.5">
                            Type
                          </p>
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {u.user_type === "caregiver"
                              ? "🤝 Caregiver"
                              : u.user_type === "self"
                              ? "👤 Self"
                              : "—"}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium mb-0.5">
                            Product
                          </p>
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {u.product_sku || "—"}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium mb-0.5">
                            Qty
                          </p>
                          <p className="text-xs font-semibold text-[#0F172A]">
                            {u.quantity ?? "—"}
                          </p>
                        </div>
                      </div>
                      {u.created_at && (
                        <p className="text-[11px] text-[#94A3B8] mt-2">
                          Joined{" "}
                          {new Date(u.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E2E8F0] bg-white">
        <div className="flex items-center justify-between px-6 lg:px-10 py-4 text-xs text-[#94A3B8]">
          <p>© 2026 OxiSure Tech Solutions</p>
          <div className="flex gap-4">
            <a
              href="https://oxisuretechsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1B365D] transition-colors"
            >
              Website
            </a>
            <a
              href="mailto:support@oxisuretechsolutions.com"
              className="hover:text-[#1B365D] transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
