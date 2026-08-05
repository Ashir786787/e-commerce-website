import Link from "next/link";
import {
  CheckCircle2,
  Mail,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import AdminPagination from "@/components/admin/AdminPagination";
import DeleteUserButton from "@/components/admin/DeleteUserButton";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getCurrentUser } from "@/services/auth.service";

export const dynamic = "force-dynamic";

interface AdminUsersPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const { search, page: pageParam } = await searchParams;

  await connectDB();

  const limit = 10;
  const requestedPage = Math.max(1, Number(pageParam) || 1);

  const query: Record<string, unknown> = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { fullName: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const currentAdmin = await getCurrentUser().catch(() => null);
  const currentAdminId = currentAdmin?.id.toString();

  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
  const currentPage = Math.min(requestedPage, totalPages);
  const skip = (currentPage - 1) * limit;

  const users = await User.find(query)
    .select("fullName email role isVerified createdAt")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            User Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
            Users
          </h1>
          <p className="mt-1.5 text-neutral-600">
            Browse and manage all NovaCart accounts.
          </p>
        </div>
      </div>

      <form className="mt-8">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Search by name or email…"
            className="h-12 w-full rounded-xl border border-neutral-300 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {users.length > 0 ? (
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Name
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Email
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Role
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id.toString()}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-neutral-950">{user.fullName}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                      <span className="truncate text-sm text-neutral-600">
                        {user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                      <ShieldCheck className="h-3 w-3" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
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
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/users/${user._id.toString()}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 text-xs font-semibold text-neutral-800 transition hover:border-indigo-300 hover:text-indigo-600"
                      >
                        Manage
                      </Link>
                      <DeleteUserButton
                        userId={user._id.toString()}
                        userName={user.fullName}
                        disabled={user._id.toString() === currentAdminId}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <ShieldCheck className="h-12 w-12 text-neutral-300" />
            <p className="mt-4 text-lg font-semibold text-neutral-950">No users found</p>
            <p className="mt-2 text-sm text-neutral-500">
              {search
                ? "Try a different search term."
                : "There are no registered users yet."}
            </p>
          </div>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
