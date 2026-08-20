"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, Settings, X } from "lucide-react";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { adminNavigation, isAdminNavActive } from "@/lib/admin-navigation";
import { useUnreadChats } from "@/hooks/useUnreadChats";

interface AdminMobileNavProps {
  adminName: string;
  adminEmail: string;
}

export default function AdminMobileNav({
  adminName,
  adminEmail,
}: AdminMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState("");
  const pathname = usePathname();
  const unreadChats = useUnreadChats();

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Toggle admin navigation"
        aria-expanded={isOpen}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600 lg:hidden"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-gradient-to-b from-[#0c0c14] via-[#0b0b13] to-[#08080e] text-white shadow-2xl">
            <div className="relative px-6 py-6">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/25">
                    N
                  </div>
                  <div>
                    <p className="text-xl font-bold tracking-tight text-white">
                      NovaCart
                    </p>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-500">
                      Admin Panel
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close navigation"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 min-h-0">
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = isAdminNavActive(item.href, pathname);

                return item.separator ? (
                  <div key={item.href} className="my-3">
                    <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-neutral-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {item.label}
                    {item.href === "/admin/messages" && unreadChats > 0 && (
                      <span className="ml-auto flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {unreadChats > 99 ? "99+" : unreadChats}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto px-3 pb-4 space-y-2">
              <div className="mx-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <Link
                href="/admin/settings"
                onClick={() => setIsOpen(false)}
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

              <AdminLogoutButton
                onBeforeNavigate={() => setIsOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-500 transition-all hover:bg-red-500/10 hover:text-red-400"
              />
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
