export type NotificationType =
  | "new_order"
  | "order_status"
  | "payment"
  | "chat"
  | "low_stock";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: number;
}

export interface CreateNotificationInput {
  targetKey: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  notificationId?: string;
}

export const ADMIN_NOTIFICATION_KEY = "admin";
