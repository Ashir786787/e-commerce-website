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
    <aside className="hidden w-72 h-screen sticky top-0 flex-shrink-0 flex-col border-r border-neutral-800 bg-[#0b0b0b] text-white lg:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/admin/dashboard" className="block">
          <p className="text-2xl font-bold text-white">
            NovaCart
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            Admin Dashboard
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = isAdminNavActive(item.href, pathname);

          return item.separator ? (
            <div
              key={item.href}
              className="border-t border-white/10 pt-3"
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-xl bg-indigo-600/20 px-4 py-3 text-sm font-medium text-indigo-200 transition hover:bg-indigo-600/30 hover:text-white"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </div>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                  : "text-neutral-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4 space-y-3">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            isAdminNavActive("/admin/settings", pathname)
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
              : "text-neutral-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>

        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">
            {adminName}
          </p>

          <p className="mt-1 truncate text-xs text-neutral-400">
            {adminEmail}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
              Admin
            </span>
          </div>
        </div>

        <AdminLogoutButton className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400" />
      </div>
    </aside>
  );
}
