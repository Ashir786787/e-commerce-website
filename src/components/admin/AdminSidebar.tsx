"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { adminNavigation, isAdminNavActive } from "@/lib/admin-navigation";

interface AdminSidebarProps {
  adminName: string;
  adminEmail: string;
}

export default function AdminSidebar({
  adminName,
  adminEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 h-screen sticky top-0 z-40 flex-shrink-0 flex-col bg-gradient-to-b from-[#0c0c14] via-[#0b0b13] to-[#08080e] text-white shadow-[2px_0_24px_rgba(0,0,0,0.25)] lg:flex">
      <div className="relative px-6 py-7">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
        <Link href="/admin/dashboard" className="block group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
              N
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                NovaCart
              </p>
              <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
                Admin Panel
              </p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = isAdminNavActive(item.href, pathname);

          return item.separator ? (
            <div key={item.href} className="my-3">
              <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <Link
                href={item.href}
                className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-violet-500/10 px-4 py-3 text-sm font-medium text-indigo-300 transition-all hover:from-indigo-500/25 hover:to-violet-500/20 hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                  : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pb-4 space-y-2">
        <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            isAdminNavActive("/admin/settings", pathname)
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
              : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
          }`}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>

        <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {adminName}
              </p>
              <p className="truncate text-[11px] text-neutral-500">
                {adminEmail}
              </p>
            </div>
          </div>
        </div>

        <AdminLogoutButton className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-500 transition-all hover:bg-red-500/10 hover:text-red-400" />
      </div>
    </aside>
  );
}
