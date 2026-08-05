import {
  get,
  getDatabase,
  off,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  update,
  type Database,
} from "firebase/database";
import { getApp, getApps, initializeApp } from "firebase/app";

import type {
  AppNotification,
  CreateNotificationInput,
} from "@/types/Notification";

let cachedDatabase: Database | null | undefined;

function getDatabaseSafely(): Database | null {
  if (cachedDatabase !== undefined) {
    return cachedDatabase;
  }

  let resolved: Database | null = null;

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  };

  const configMissing = Object.values(firebaseConfig).some((value) => !value);

  if (configMissing) {
    console.warn(
      "NEXT_PUBLIC_FIREBASE_* env vars are missing — notifications disabled."
    );
    cachedDatabase = null;
    return null;
  }

  try {
    const app =
      getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    resolved = getDatabase(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }

  cachedDatabase = resolved;
  return resolved;
}

function getNotificationRef(db: Database, targetKey: string) {
  return ref(db, `notifications/${targetKey}`);
}

export async function createNotification({
  targetKey,
  type,
  title,
  body,
  link,
  notificationId,
}: CreateNotificationInput) {
  const db = getDatabaseSafely();

  if (!db) {
    return null;
  }

  const notificationRef = notificationId
    ? ref(db, `notifications/${targetKey}/${notificationId}`)
    : push(getNotificationRef(db, targetKey));

  const notification: Omit<AppNotification, "id"> = {
    type,
    title,
    body,
    read: false,
    createdAt: Date.now(),
  };

  if (link) {
    notification.link = link;
  }

  await update(ref(db), {
    [`notifications/${targetKey}/${notificationRef.key}`]: notification,
  });

  return notificationRef.key;
}

export async function createNotificationSafe(
  input: CreateNotificationInput
) {
  try {
    await createNotification(input);
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

export function subscribeToNotifications(
  targetKey: string,
  callback: (notifications: AppNotification[]) => void
) {
  const db = getDatabaseSafely();

  if (!db) {
    return () => {};
  }

  const notificationsQuery = query(
    getNotificationRef(db, targetKey),
    orderByChild("createdAt")
  );

  const handler = onValue(notificationsQuery, (snapshot) => {
    const notifications: AppNotification[] = [];

    snapshot.forEach((childSnapshot) => {
      notifications.push({
        id: childSnapshot.key!,
        ...(childSnapshot.val() as Omit<AppNotification, "id">),
      });
    });

    notifications.sort((a, b) => b.createdAt - a.createdAt);
    callback(notifications);
  });

  return () => {
    off(notificationsQuery, "value", handler);
  };
}

export async function markNotificationRead({
  targetKey,
  notificationId,
}: {
  targetKey: string;
  notificationId: string;
}) {
  const db = getDatabaseSafely();

  if (!db) {
    return;
  }

  await update(ref(db), {
    [`notifications/${targetKey}/${notificationId}/read`]: true,
  });
}

export async function markAllNotificationsRead(targetKey: string) {
  const db = getDatabaseSafely();

  if (!db) {
    return;
  }

  const snapshot = await get(getNotificationRef(db, targetKey));

  const updates: Record<string, boolean> = {};

  snapshot.forEach((childSnapshot) => {
    const notification = childSnapshot.val() as Omit<AppNotification, "id">;
    if (!notification.read) {
      updates[`notifications/${targetKey}/${childSnapshot.key}/read`] = true;
    }
  });

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }
}
