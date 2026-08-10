"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface DeleteUserButtonProps {
  userId: string;
  userName: string;
  variant?: "icon" | "full";
  disabled?: boolean;
}

export default function DeleteUserButton({
  userId,
  userName,
  variant = "icon",
  disabled = false,
}: DeleteUserButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete ${userName}? This will permanently remove the account along with its cart and wishlist. This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete user.");
      }

      toast.success("User deleted successfully.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete user.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleDelete}
        disabled={disabled || isDeleting}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-300 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete User"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={disabled || isDeleting}
      aria-label={`Delete ${userName}`}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
