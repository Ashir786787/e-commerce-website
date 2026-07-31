"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

export default function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (
      !window.confirm(
        `Delete ${categoryName}?${
          productCount > 0
            ? ` This category has ${productCount} product${
                productCount === 1 ? "" : "s"
              }.`
            : ""
        } This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/categories/${categoryId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete category."
        );
      }

      toast.success("Category deleted successfully.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete category."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete ${categoryName}`}
      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
