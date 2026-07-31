"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productName}" permanently? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const response = await fetch(
        `/api/admin/products/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete product."
        );
      }

      toast.success("Product deleted successfully.");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete product."
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
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? "Deleting..." : "Delete Product"}
    </button>
  );
}