import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { notFound, redirect } from "next/navigation";

import DeleteUserButton from "@/components/admin/DeleteUserButton";
import UserManagementForm from "@/components/admin/UserManagementForm";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/services/auth.service";

export const dynamic = "force-dynamic";

interface AdminUserDetailsPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function AdminUserDetailsPage({
  params,
}: AdminUserDetailsPageProps) {
  const { id } = await params;

  await connectDB();

  const currentAdmin = await getCurrentUser();

  if (!currentAdmin) {
    redirect("/login");
  }

  if (currentAdmin.role !== "admin") {
    redirect("/");
  }

  const user = await User.findById(id)
    .select("fullName email role avatar isVerified createdAt updatedAt")
    .lean();

  if (!user) {
    notFound();
  }

  const isCurrentAdmin = currentAdmin.id.toString() === user._id.toString();

  const initial = user.fullName?.charAt(0).toUpperCase() || "U";

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Link>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          User Management
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          User Details
        </h1>
        <p className="mt-1.5 text-neutral-600">
          Review and manage this NovaCart account.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">
              {initial}
            </div>
            <div className="min-w-0">
              <h2 className="break-words text-xl font-bold text-neutral-950">
                {user.fullName}
              </h2>
              <p className="mt-2 break-all text-sm text-neutral-500">{user.email}</p>
              {isCurrentAdmin && (
                <span className="mt-3 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Your Account
                </span>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center gap-2 text-neutral-500">
                <Mail className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Email
                </p>
              </div>
              <p className="mt-3 break-all text-sm font-semibold text-neutral-950">
                {user.email}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center gap-2 text-neutral-500">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Role
                </p>
              </div>
              <p className="mt-3 text-sm font-semibold capitalize text-neutral-950">
                {user.role}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center gap-2 text-neutral-500">
                <UserRound className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Verification
                </p>
              </div>
              <div className="mt-3">
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                    <XCircle className="h-4 w-4" />
                    Unverified
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-neutral-50 p-4">
              <div className="flex items-center gap-2 text-neutral-500">
                <CalendarDays className="h-4 w-4" />
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Joined
                </p>
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-950">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </section>

        <UserManagementForm
          user={{
            id: user._id.toString(),
            role: user.role,
            isVerified: user.isVerified,
          }}
          isCurrentAdmin={isCurrentAdmin}
        />

        <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-neutral-950">Delete User</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Permanently remove this account and its cart and wishlist data.
              </p>
            </div>
          </div>

          {isCurrentAdmin ? (
            <p className="mt-4 text-sm font-medium text-amber-700">
              You cannot delete your own account.
            </p>
          ) : (
            <DeleteUserButton
              userId={user._id.toString()}
              userName={user.fullName}
              variant="full"
            />
          )}
        </section>
      </div>
    </div>
  );
}
