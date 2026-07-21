"use client";

import { Trash2 } from "lucide-react";

type RemoveButtonProps = {
  onRemove: () => void;
  loading?: boolean;
};

export default function RemoveButton({
  onRemove,
  loading = false,
}: RemoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onRemove}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      Remove
    </button>
  );
}