import type { Database } from "firebase-admin/database";

export type RealtimeOrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type RealtimePaymentStatus =
  | "pending"
  | "paid"
  | "failed";

export interface RealtimeOrderUpdate {
  orderId: string;
  userId: string;
  orderNumber: string;
  orderStatus: RealtimeOrderStatus;
  paymentStatus: RealtimePaymentStatus;
  updatedAt: number;
  paidAt?: number | null;
  deliveredAt?: number | null;
}

interface PublishOrderUpdateInput {
  orderId: string;
  userId: string;
  orderNumber: string;
  orderStatus: RealtimeOrderStatus;
  paymentStatus: RealtimePaymentStatus;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
}

let cachedDatabase: Database | null | undefined;

async function getAdminDatabase(): Promise<Database | null> {
  if (cachedDatabase !== undefined) {
    return cachedDatabase;
  }

  try {
    const { getAdminDatabase: resolveAdminDatabase } = await import("@/lib/firebase-admin");
    cachedDatabase = resolveAdminDatabase();
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    cachedDatabase = null;
  }

  return cachedDatabase;
}

export async function publishOrderUpdate({
  orderId,
  userId,
  orderNumber,
  orderStatus,
  paymentStatus,
  paidAt,
  deliveredAt,
}: PublishOrderUpdateInput) {
  const db = await getAdminDatabase();

  if (!db) {
    throw new Error("Firebase Admin is not configured.");
  }

  const update: RealtimeOrderUpdate = {
    orderId,
    userId,
    orderNumber,
    orderStatus,
    paymentStatus,
    updatedAt: Date.now(),
    paidAt: paidAt ? paidAt.getTime() : null,
    deliveredAt: deliveredAt
      ? deliveredAt.getTime()
      : null,
  };

  await db.ref(`orderUpdates/${userId}/${orderId}`).set(update);

  return update;
}

export async function publishOrderUpdateSafe(input: PublishOrderUpdateInput) {
  try {
    await publishOrderUpdate(input);
  } catch (error) {
    console.warn("Skipped Firebase order update publish:", error);
  }
}
