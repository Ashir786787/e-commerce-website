"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ToggleDiscountStatusProps {
  codeId: string;
  isActive: boolean;
  onToggle?: (newStatus: boolean) => void;
}

export default function ToggleDiscountStatus({
  codeId,
  isActive,
  onToggle,
}: ToggleDiscountStatusProps) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(isActive);

  async function handleToggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/discount-codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      setCurrentStatus(!currentStatus);
      onToggle?.(!currentStatus);
      toast.success(`Code ${!currentStatus ? "activated" : "deactivated"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={loading}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        currentStatus ? "bg-indigo-600" : "bg-neutral-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          currentStatus ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}
