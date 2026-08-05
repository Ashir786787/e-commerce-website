import { ShieldCheck } from "lucide-react";

import AdminLoginForm from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/40">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">NovaCart Admin</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Sign in to manage your store
          </p>
        </div>

        <AdminLoginForm />

        <p className="mt-6 text-center text-xs text-neutral-500">
          Admin access is restricted to authorized staff only.
        </p>
      </div>
    </div>
  );
}
