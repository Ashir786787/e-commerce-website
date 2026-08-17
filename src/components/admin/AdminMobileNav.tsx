"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, Settings, X } from "lucide-react";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import { adminNavigation, isAdminNavActive } from "@/lib/admin-navigation";

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
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600 lg:hidden"
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

          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#0b0b0b] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
              <div>
                <p className="text-2xl font-bold text-white">
                  NovaCart
                </p>

                <p className="mt-1 text-sm text-neutral-400">
                  Admin Dashboard
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
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
                      onClick={() => setIsOpen(false)}
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
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
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
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isAdminNavActive("/admin/settings", pathname)
                    ? "bg-indigo-600 text-white"
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

              <AdminLogoutButton
                onBeforeNavigate={() => setIsOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-300 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              />
            </div>
          </aside>
        </div>,
        document.body
      )}
    </>
  );
}
