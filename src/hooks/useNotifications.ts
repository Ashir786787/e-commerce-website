"use client";

import { useState } from "react";
import { toast } from "sonner";

import { requestNotificationPermission } from "@/lib/firebase/notification";

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function enableNotifications() {
    try {
      setLoading(true);
      const result = await requestNotificationPermission();

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setToken(result.token!);

      const response = await fetch("/api/notifications/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: result.token }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save notification token.");
      }

      toast.success("Notifications enabled successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to enable notifications.");
    } finally {
      setLoading(false);
    }
  }

  return { token, loading, enableNotifications };
}
