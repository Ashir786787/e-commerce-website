import {
  get,
  off,
  onValue,
  push,
  ref,
  remove,
  set,
} from "firebase/database";

import { getFirebaseDatabase } from "@/lib/firebase";
import type { ActiveSession } from "@/types/Chat";

const SESSIONS_PATH = "activeSessions";

export async function startSession({
  userId,
  userName,
  adminId,
  adminName,
  durationMinutes,
}: {
  userId: string;
  userName: string;
  adminId: string;
  adminName: string;
  durationMinutes: number;
}): Promise<string> {
  const db = getFirebaseDatabase();
  if (!db) {
    throw new Error("Chat is unavailable right now.");
  }

  const now = Date.now();
  const sessionRef = ref(db, `${SESSIONS_PATH}/${userId}`);
  const newRef = push(sessionRef);

  const session: Omit<ActiveSession, "sessionId"> & { sessionId: string } = {
    sessionId: newRef.key!,
    userId,
    userName,
    adminId,
    adminName,
    startedAt: now,
    expiresAt: now + durationMinutes * 60 * 1000,
    status: "active",
  };

  await set(newRef, session);
  return newRef.key!;
}

export async function endSession(userId: string, sessionKey: string): Promise<void> {
  const db = getFirebaseDatabase();
  if (!db) return;

  const sessionRef = ref(db, `${SESSIONS_PATH}/${userId}/${sessionKey}`);
  const snapshot = await get(sessionRef);

  if (snapshot.exists()) {
    const data = snapshot.val() as Omit<ActiveSession, "sessionId"> & { sessionId: string };
    if (data.status === "active") {
      await set(
        ref(db, `${SESSIONS_PATH}/${userId}/${sessionKey}/status`),
        "ended"
      );
      await set(
        ref(db, `${SESSIONS_PATH}/${userId}/${sessionKey}/endedAt`),
        Date.now()
      );
    }
  }
}

export async function endAllActiveSessions(userId: string): Promise<void> {
  const db = getFirebaseDatabase();
  if (!db) return;

  const sessionsRef = ref(db, `${SESSIONS_PATH}/${userId}`);
  const snapshot = await get(sessionsRef);

  if (!snapshot.exists()) return;

  const updates: Record<string, unknown> = {};
  snapshot.forEach((child) => {
    const data = child.val() as ActiveSession;
    if (data.status === "active") {
      updates[`${SESSIONS_PATH}/${userId}/${child.key}/status`] = "ended";
      updates[`${SESSIONS_PATH}/${userId}/${child.key}/endedAt`] = Date.now();
    }
  });

  if (Object.keys(updates).length > 0) {
    const { update } = await import("firebase/database");
    await update(ref(db), updates);
  }
}

export function getActiveSessionForUser(userId: string): Promise<ActiveSession | null> {
  const db = getFirebaseDatabase();
  if (!db) return Promise.resolve(null);

  const sessionsRef = ref(db, `${SESSIONS_PATH}/${userId}`);

  return new Promise((resolve) => {
    get(sessionsRef).then((snapshot) => {
      if (!snapshot.exists()) {
        resolve(null);
        return;
      }

      let found: ActiveSession | null = null;
      snapshot.forEach((child) => {
        const data = child.val() as Omit<ActiveSession, "sessionId"> & { sessionId: string };
        if (data.status === "active" && data.expiresAt > Date.now()) {
          if (!found || data.startedAt > found.startedAt) {
            found = { ...data, sessionId: child.key! };
          }
        }
      });

      resolve(found);
    }).catch(() => {
      resolve(null);
    });
  });
}

export function subscribeToSession(
  userId: string,
  callback: (session: ActiveSession | null) => void
): () => void {
  const db = getFirebaseDatabase();
  if (!db) {
    callback(null);
    return () => {};
  }

  const sessionsRef = ref(db, `${SESSIONS_PATH}/${userId}`);

  const handler = onValue(
    sessionsRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      let found: ActiveSession | null = null;
      snapshot.forEach((child) => {
        const data = child.val() as Omit<ActiveSession, "sessionId"> & { sessionId: string };
        if (data.status === "active" && data.expiresAt > Date.now()) {
          if (!found || data.startedAt > found.startedAt) {
            found = { ...data, sessionId: child.key! };
          }
        }
      });

      callback(found);
    },
    () => {
      callback(null);
    }
  );

  return () => {
    off(sessionsRef, "value", handler);
  };
}

export function subscribeToAllActiveSessions(
  callback: (sessions: ActiveSession[]) => void
): () => void {
  const db = getFirebaseDatabase();
  if (!db) {
    callback([]);
    return () => {};
  }

  const sessionsRef = ref(db, SESSIONS_PATH);

  const handler = onValue(
    sessionsRef,
    (snapshot) => {
      const sessions: ActiveSession[] = [];
      const now = Date.now();

      snapshot.forEach((userSnapshot) => {
        userSnapshot.forEach((child) => {
          const data = child.val() as Omit<ActiveSession, "sessionId"> & { sessionId: string };
          if (data.status === "active" && data.expiresAt > now) {
            sessions.push({ ...data, sessionId: child.key! });
          }
        });
      });

      sessions.sort((a, b) => b.startedAt - a.startedAt);
      callback(sessions);
    },
    () => {
      callback([]);
    }
  );

  return () => {
    off(sessionsRef, "value", handler);
  };
}

export async function deleteSession(userId: string, sessionKey: string): Promise<void> {
  const db = getFirebaseDatabase();
  if (!db) return;

  await remove(ref(db, `${SESSIONS_PATH}/${userId}/${sessionKey}`));
}
