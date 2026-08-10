"use client";

import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { toast } from "sonner";

import { getFirebaseMessaging } from "@/lib/firebase/messaging";

export default function ForegroundNotificationListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function initializeListener() {
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      unsubscribe = onMessage(messaging, (payload) => {
        toast.success(payload.data?.title || payload.notification?.title || "NovaCart", {
          description: payload.data?.body || payload.notification?.body || "You have a new notification.",
        });
      });
    }

    initializeListener();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return null;
}
