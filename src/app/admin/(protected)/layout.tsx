import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminSidebar from "@/components/admin/AdminSidebar";
import NotificationBell from "@/components/notifications/NotificationBell";
import { ADMIN_NOTIFICATION_KEY } from "@/types/Notification";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const admin = await requireAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      <AdminSidebar
        adminName={admin.fullName}
        adminEmail={admin.email}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200" />
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
              <NotificationBell targetKey={ADMIN_NOTIFICATION_KEY} variant="admin" />
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-neutral-950">
                  {admin.fullName}
                </p>
                <p className="text-xs text-neutral-500">
                  Administrator
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-md shadow-indigo-500/20">
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
