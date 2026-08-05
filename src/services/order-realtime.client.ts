"use client";

import {
  off,
  onValue,
  ref,
} from "firebase/database";

import { getFirebaseDatabase } from "@/lib/firebase";
import type { RealtimeOrderUpdate } from "./order-realtime.server";

export function subscribeToOrderUpdate(
  userId: string,
  orderId: string,
  callback: (
    update: RealtimeOrderUpdate | null
  ) => void
) {
  const db = getFirebaseDatabase();

  if (!db) {
    return () => {};
  }

  const orderUpdateRef = ref(
    db,
    `orderUpdates/${userId}/${orderId}`
  );

  const handler = onValue(
    orderUpdateRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback(
        snapshot.val() as RealtimeOrderUpdate
      );
    }
  );

  return () => {
    off(orderUpdateRef, "value", handler);
  };
}
