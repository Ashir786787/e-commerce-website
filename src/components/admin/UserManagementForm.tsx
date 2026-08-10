"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Save, ShieldCheck } from "lucide-react";

interface UserManagementFormProps {
  user: {
    id: string;
    role: "user" | "admin";
    isVerified: boolean;
  };
  isCurrentAdmin: boolean;
}

export default function UserManagementForm({
  user,
  isCurrentAdmin,
}: UserManagementFormProps) {
  const [role, setRole] = useState<"user" | "admin">(user.role);
  const [isVerified, setIsVerified] = useState(user.isVerified);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsSaving(true);

      const response = await fetch(
        `/api/admin/users/${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            role,
            isVerified,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update user.");
      }

      toast.success("User updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update user."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-600" />

        <div>
          <h2 className="text-xl font-semibold text-neutral-950">
            Account Controls
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Update role and verification status.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="role"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Role
          </label>

          <select
            id="role"
            value={role}
            disabled={isCurrentAdmin}
            onChange={(event) =>
              setRole(
                event.target.value as
                  | "user"
                  | "admin"
              )
            }
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-neutral-100"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {isCurrentAdmin && (
            <p className="mt-2 text-xs text-amber-700">
              You cannot remove your own admin role.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="verification"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Verification
          </label>

          <select
            id="verification"
            value={
              isVerified
                ? "verified"
                : "unverified"
            }
            onChange={(event) =>
              setIsVerified(
                event.target.value === "verified"
              )
            }
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="verified">
              Verified
            </option>
            <option value="unverified">
              Unverified
            </option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        <Save className="h-4 w-4" />

        {isSaving
          ? "Saving..."
          : "Save Changes"}
      </button>
    </form>
  );
}