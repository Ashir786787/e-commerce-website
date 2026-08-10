"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Inbox } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  markAllNotificationsRead,
  subscribeToNotifications,
} from "@/services/notification.service";
import type { AppNotification } from "@/types/Notification";

interface NotificationBellProps {
  targetKey: string;
  variant?: "site" | "admin";
  className?: string;
}

function formatRelativeTime(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return new Date(timestamp).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell({
  targetKey,
  variant = "site",
  className,
}: NotificationBellProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(targetKey, (items) => {
      setNotifications(items);
    });

    return unsubscribe;
  }, [targetKey]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  function handleOpen() {
    if (!isOpen && unreadCount > 0) {
      void markAllNotificationsRead(targetKey);
    }

    setIsOpen((current) => !current);
  }

  function handleSelect(notification: AppNotification) {
    setIsOpen(false);

    if (notification.link) {
      router.push(notification.link);
    }
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-neutral-100",
          variant === "admin"
            ? "text-indigo-600 hover:text-indigo-700"
            : "text-neutral-600 hover:text-neutral-900"
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <p className="text-sm font-semibold text-neutral-950">
              Notifications
            </p>
            {notifications.some((notification) => !notification.read) && (
              <button
                type="button"
                onClick={() => {
                  void markAllNotificationsRead(targetKey);
                }}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition hover:text-indigo-700"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Inbox className="h-8 w-8 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-500">
                  No notifications yet
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(notification)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-neutral-50",
                        !notification.read && "bg-indigo-50/60"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          notification.read
                            ? "bg-neutral-200"
                            : "bg-indigo-600"
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-neutral-950">
                          {notification.title}
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-neutral-500">
                          {notification.body}
                        </span>
                        <span className="mt-1 block text-[11px] font-medium text-neutral-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
