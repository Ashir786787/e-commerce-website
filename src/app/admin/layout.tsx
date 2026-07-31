import Link from "next/link";

import AdminLogoutButton from "@/components/admin/AdminLogoutButton";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import { requireAdmin } from "@/lib/admin";
import { adminNavigation } from "@/lib/admin-navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const admin = await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      <aside className="hidden w-72 h-screen sticky top-0 flex-shrink-0 flex-col border-r border-neutral-800 bg-[#0b0b0b] text-white lg:flex">
          <div className="border-b border-white/10 px-6 py-6">
            <Link href="/admin" className="block">
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
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">
                {admin.fullName}
              </p>

              <p className="mt-1 truncate text-xs text-neutral-400">
                {admin.email}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                  Admin
                </span>

                <AdminLogoutButton />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                      <AdminMobileNav
                        adminName={admin.fullName}
                        adminEmail={admin.email}
                      />

                      <div>
                        <p className="text-sm font-semibold text-neutral-950">
                          Admin Panel
                        </p>

                        <p className="hidden text-xs text-neutral-500 sm:block">
                          Manage NovaCart operations
                        </p>
                      </div>
                    </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-neutral-950">
                    {admin.fullName}
                  </p>

                  <p className="text-xs text-neutral-500">
                    Administrator
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                  {admin.fullName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
    </div>
  );
}