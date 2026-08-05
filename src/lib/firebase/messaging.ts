"use client";

import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

import { getFirebaseApp } from "@/lib/firebase";

let messagingInstance: Messaging | null = null;

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();
  if (!supported) {
    console.warn("Firebase Cloud Messaging is not supported in this browser.");
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }

  return messagingInstance;
}
