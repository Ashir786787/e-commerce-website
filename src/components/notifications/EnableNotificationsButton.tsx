"use client";

import { Bell, Loader2 } from "lucide-react";

import { useNotifications } from "@/hooks/useNotifications";

export default function EnableNotificationsButton() {
  const { enableNotifications, loading, token } = useNotifications();

  return (
    <button
      type="button"
      onClick={enableNotifications}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
      {token ? "Notifications Enabled" : "Enable Notifications"}
    </button>
  );
}
