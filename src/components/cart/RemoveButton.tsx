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
      className="flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Remove item"
    >
      <Trash2 className="h-[18px] w-[18px]" />
    </button>
  );
}
