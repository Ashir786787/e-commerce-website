"use client";

import { useState } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TestNotificationButton() {
  const [isSending, setIsSending] = useState(false);

  async function handleTest() {
    try {
      setIsSending(true);
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        credentials: "include",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Notification test failed.");
      }

      toast.success("Notification sent. Check your system notifications.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Notification test failed.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleTest}
      disabled={isSending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-60"
    >
      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
      {isSending ? "Sending..." : "Send Test Notification"}
    </button>
  );
}
