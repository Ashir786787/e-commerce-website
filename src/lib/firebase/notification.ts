"use client";

import { getToken } from "firebase/messaging";

import { getFirebaseMessaging } from "./messaging";

export async function requestNotificationPermission() {
  if (typeof window === "undefined") {
    return { success: false, message: "Notifications are only available in the browser." };
  }

  if (!("Notification" in window)) {
    return { success: false, message: "This browser does not support notifications." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { success: false, message: "Notification permission was denied." };
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    return { success: false, message: "Firebase Messaging is not supported." };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return { success: false, message: "Unable to generate a notification token." };
    }

    return { success: true, token, message: "Notification token generated successfully." };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to initialize notifications.",
    };
  }
}
