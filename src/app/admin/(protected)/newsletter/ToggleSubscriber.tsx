"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ToggleSubscriberProps {
  id: string;
  subscribed: boolean;
}

export default function ToggleSubscriber({
  id,
  subscribed,
}: ToggleSubscriberProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, subscribed: !subscribed }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to update subscriber.");
      }

      toast.success(
        subscribed
          ? "Subscriber unsubscribed."
          : "Subscriber restored."
      );

      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isUpdating}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        subscribed
          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      }`}
    >
      {isUpdating
        ? "Updating..."
        : subscribed
          ? "Unsubscribe"
          : "Restore"}
    </button>
  );
}
