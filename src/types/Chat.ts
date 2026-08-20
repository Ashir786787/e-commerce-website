export type ChatSenderRole = "user" | "admin";

export interface ChatConversation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: number;
  updatedAt: number;
  lastMessage: string;
  lastMessageSenderRole: ChatSenderRole;
  unreadByAdmin: number;
  unreadByUser: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: ChatSenderRole;
  text: string;
  createdAt: number;
  read: boolean;
}

export interface CreateConversationInput {
  userId: string;
  userName: string;
  userEmail: string;
}

export interface SendMessageInput {
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: ChatSenderRole;
  text: string;
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  userName: string;
  adminId: string;
  adminName: string;
  startedAt: number;
  expiresAt: number;
  status: "active" | "ended";
  endedAt?: number;
}