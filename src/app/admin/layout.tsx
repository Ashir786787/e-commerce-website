import Link from "next/link";
import {
  BarChart3,
  Boxes,
  FolderTree,
  LayoutDashboard,
  LogOut,
  PackageSearch,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";

import AdminMobileNav from "@/components/admin/AdminMobileNav";
import { requireAdmin } from "@/lib/admin";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: PackageSearch,
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Discount Codes",
    href: "/admin/discount-codes",
    icon: Tag,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-neutral-800 bg-neutral-950 text-white lg:flex lg:flex-col">
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
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
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

                <Link
                  href="/api/auth/logout"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
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

          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}