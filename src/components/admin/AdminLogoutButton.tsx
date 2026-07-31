"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

interface AdminLogoutButtonProps {
  onBeforeNavigate?: () => void;
  className?: string;
}

export default function AdminLogoutButton({
  onBeforeNavigate,
  className,
}: AdminLogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }
    } catch {
      setIsLoggingOut(false);
      return;
    }

    onBeforeNavigate?.();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={
        className ??
        "inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition hover:text-white"
      }
    >
      <LogOut className="h-4 w-4" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
