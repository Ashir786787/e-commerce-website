"use client";

import { useEffect } from "react";

export default function FirebaseServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      console.warn("Service workers are not supported in this browser.");
      return;
    }

    navigator.serviceWorker
      .register("/firebase-messaging-sw.js", { scope: "/" })
      .catch((error) => {
        console.error("Firebase service worker registration failed:", error);
      });
  }, []);

  return null;
}
