import {
  get,
  increment,
  off,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  set,
  update,
} from "firebase/database";

import { database } from "@/lib/firebase";
import type { ChatConversation, ChatMessage, CreateConversationInput, SendMessageInput } from "@/types/Chat";

function getConversationId(userId: string) {
  return userId;
}

export async function createOrGetConversation({ userId, userName, userEmail }: CreateConversationInput) {
  const conversationId = getConversationId(userId);
  const conversationRef = ref(database, `conversations/${conversationId}`);
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

  const now = Date.now();
  const messagesRef = ref(database, `messages/${conversationId}`);
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

  await update(ref(database), {
    [`messages/${conversationId}/${newMessageRef.key}`]: message,
    [`conversations/${conversationId}/updatedAt`]: conversationUpdates.updatedAt,
    [`conversations/${conversationId}/lastMessage`]: conversationUpdates.lastMessage,
    [`conversations/${conversationId}/lastMessageSenderRole`]: conversationUpdates.lastMessageSenderRole,
    [`conversations/${conversationId}/${senderRole === "user" ? "unreadByAdmin" : "unreadByUser"}`]: increment(1),
  });

  return newMessageRef.key;
}

export function subscribeToMessages(conversationId: string, callback: (messages: ChatMessage[]) => void) {
  const messagesQuery = query(ref(database, `messages/${conversationId}`), orderByChild("createdAt"));

  const handler = onValue(messagesQuery, (snapshot) => {
    const messages: ChatMessage[] = [];

    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key!,
        ...(childSnapshot.val() as Omit<ChatMessage, "id">),
      });
    });

    callback(messages);
  });

  return () => {
    off(messagesQuery, "value", handler);
  };
}

export function subscribeToConversation(conversationId: string, callback: (conversation: ChatConversation | null) => void) {
  const conversationRef = ref(database, `conversations/${conversationId}`);

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
  const conversationsQuery = query(ref(database, "conversations"), orderByChild("updatedAt"));

  const handler = onValue(conversationsQuery, (snapshot) => {
    const conversations: ChatConversation[] = [];

    snapshot.forEach((childSnapshot) => {
      conversations.push({
        id: childSnapshot.key!,
        ...(childSnapshot.val() as Omit<ChatConversation, "id">),
      });
    });

    conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    callback(conversations);
  });

  return () => {
    off(conversationsQuery, "value", handler);
  };
}

export async function markConversationAsRead({ conversationId, readerRole }: { conversationId: string; readerRole: "user" | "admin" }) {
  const unreadField = readerRole === "admin" ? "unreadByAdmin" : "unreadByUser";
  const messagesRef = ref(database, `messages/${conversationId}`);
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

  await update(ref(database), updates);
}
