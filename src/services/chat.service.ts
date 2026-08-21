import {
  get,
  increment,
  off,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";

import { getFirebaseDatabase } from "@/lib/firebase";
import type { ChatConversation, ChatMessage, CreateConversationInput, SendMessageInput } from "@/types/Chat";
import { ADMIN_NOTIFICATION_KEY } from "@/types/Notification";
import { createNotificationSafe } from "@/services/notification.service";

function getConversationId(userId: string) {
  return userId;
}

export async function createOrGetConversation({ userId, userName, userEmail }: CreateConversationInput) {
  const conversationId = getConversationId(userId);
  const db = getFirebaseDatabase();

  if (!db) {
    return conversationId;
  }

  const conversationRef = ref(db, `conversations/${conversationId}`);
  const snapshot = await get(conversationRef);

  if (!snapshot.exists()) {
    const now = Date.now();
    await set(conversationRef, {
      userId,
      userName,
      userEmail,
      createdAt: now,
      updatedAt: now,
      lastMessage: "",
      lastMessageSenderRole: "user",
      unreadByAdmin: 0,
      unreadByUser: 0,
    });
  }

  return conversationId;
}

export async function sendChatMessage({ conversationId, senderId, senderName, senderRole, text }: SendMessageInput) {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error("Message cannot be empty.");
  }
  if (cleanText.length > 2000) {
    throw new Error("Message cannot exceed 2000 characters.");
  }

  const db = getFirebaseDatabase();

  if (!db) {
    throw new Error("Chat is unavailable right now. Please try again later.");
  }

  const now = Date.now();
  const messagesRef = ref(db, `messages/${conversationId}`);
  const newMessageRef = push(messagesRef);

  const message: Omit<ChatMessage, "id"> = {
    conversationId,
    senderId,
    senderName,
    senderRole,
    text: cleanText,
    createdAt: now,
    read: false,
  };

  const conversationUpdates =
    senderRole === "user"
      ? {
          updatedAt: now,
          lastMessage: cleanText,
          lastMessageSenderRole: senderRole,
          unreadByAdmin: increment(1),
        }
      : {
          updatedAt: now,
          lastMessage: cleanText,
          lastMessageSenderRole: senderRole,
          unreadByUser: increment(1),
        };

  await update(ref(db), {
    [`messages/${conversationId}/${newMessageRef.key}`]: message,
    [`conversations/${conversationId}/updatedAt`]: conversationUpdates.updatedAt,
    [`conversations/${conversationId}/lastMessage`]: conversationUpdates.lastMessage,
    [`conversations/${conversationId}/lastMessageSenderRole`]: conversationUpdates.lastMessageSenderRole,
    [`conversations/${conversationId}/${senderRole === "user" ? "unreadByAdmin" : "unreadByUser"}`]: increment(1),
  });

  if (senderRole === "user") {
    void createNotificationSafe({
      targetKey: ADMIN_NOTIFICATION_KEY,
      type: "chat",
      title: "New support message",
      body: `${senderName}: ${cleanText}`,
      link: "/admin/messages",
    });
  } else {
    void createNotificationSafe({
      targetKey: conversationId,
      type: "chat",
      title: "Support reply",
      body: `NovaCart support: ${cleanText}`,
      link: "/orders",
    });
  }

  return newMessageRef.key;
}

export function subscribeToMessages(conversationId: string, callback: (messages: ChatMessage[]) => void) {
  const db = getFirebaseDatabase();

  if (!db) {
    callback([]);
    return () => {};
  }

  const messagesRef = ref(db, `messages/${conversationId}`);

  const handler = onValue(
    messagesRef,
    (snapshot) => {
      const messages: ChatMessage[] = [];

      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key!,
          ...(childSnapshot.val() as Omit<ChatMessage, "id">),
        });
      });

      messages.sort((a, b) => a.createdAt - b.createdAt);
      callback(messages);
    },
    () => {
      callback([]);
    }
  );

  return () => {
    off(messagesRef, "value", handler);
  };
}

export function subscribeToConversation(conversationId: string, callback: (conversation: ChatConversation | null) => void) {
  const db = getFirebaseDatabase();

  if (!db) {
    return () => {};
  }

  const conversationRef = ref(db, `conversations/${conversationId}`);

  const handler = onValue(conversationRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback({
      id: conversationId,
      ...(snapshot.val() as Omit<ChatConversation, "id">),
    });
  });

  return () => {
    off(conversationRef, "value", handler);
  };
}

export function subscribeToConversations(callback: (conversations: ChatConversation[]) => void) {
  const db = getFirebaseDatabase();

  if (!db) {
    callback([]);
    return () => {};
  }

  const conversationsRef = ref(db, "conversations");

  const handler = onValue(
    conversationsRef,
    (snapshot) => {
      const conversations: ChatConversation[] = [];

      snapshot.forEach((childSnapshot) => {
        conversations.push({
          id: childSnapshot.key!,
          ...(childSnapshot.val() as Omit<ChatConversation, "id">),
        });
      });

      conversations.sort((a, b) => b.updatedAt - a.updatedAt);
      callback(conversations);
    },
    () => {
      callback([]);
    }
  );

  return () => {
    off(conversationsRef, "value", handler);
  };
}

export async function markConversationAsRead({ conversationId, readerRole }: { conversationId: string; readerRole: "user" | "admin" }) {
  const db = getFirebaseDatabase();

  if (!db) {
    return;
  }

  const unreadField = readerRole === "admin" ? "unreadByAdmin" : "unreadByUser";
  const messagesRef = ref(db, `messages/${conversationId}`);
  const snapshot = await get(messagesRef);

  const updates: Record<string, boolean | number> = {
    [`conversations/${conversationId}/${unreadField}`]: 0,
  };

  snapshot.forEach((childSnapshot) => {
    const message = childSnapshot.val() as Omit<ChatMessage, "id">;
    if (message.senderRole !== readerRole && !message.read) {
      updates[`messages/${conversationId}/${childSnapshot.key}/read`] = true;
    }
  });

  await update(ref(db), updates);
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const db = getFirebaseDatabase();
  if (!db) return;

  const updates: Record<string, null> = {};
  updates[`conversations/${conversationId}`] = null;
  updates[`messages/${conversationId}`] = null;

  await update(ref(db), updates);
}

const CONVERSATION_MAX_AGE_MS = 6 * 24 * 60 * 60 * 1000;

let lastCleanupAt = 0;

export async function cleanupOldConversations(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanupAt < 60 * 60 * 1000) return;

  const db = getFirebaseDatabase();
  if (!db) return;

  const cutoff = now - CONVERSATION_MAX_AGE_MS;
  const conversationsRef = ref(db, "conversations");
  const snapshot = await get(conversationsRef);
  if (!snapshot.exists()) {
    lastCleanupAt = now;
    return;
  }

  const updates: Record<string, null> = {};
  snapshot.forEach((child) => {
    const data = child.val() as Omit<ChatConversation, "id">;
    if ((data.updatedAt || 0) < cutoff) {
      updates[`conversations/${child.key}`] = null;
      updates[`messages/${child.key}`] = null;
    }
  });

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }

  lastCleanupAt = now;
}
