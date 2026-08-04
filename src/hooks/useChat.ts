"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createOrGetConversation,
  markConversationAsRead,
  sendChatMessage,
  subscribeToConversation,
  subscribeToMessages,
} from "@/services/chat.service";
import type { ChatConversation, ChatMessage, ChatSenderRole } from "@/types/Chat";

interface UseChatOptions {
  userId: string;
  userName: string;
  userEmail: string;
  senderRole: ChatSenderRole;
  enabled?: boolean;
}

export function useChat({ userId, userName, userEmail, senderRole, enabled = true }: UseChatOptions) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(enabled && userId));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !userId) {
      return;
    }

    let isMounted = true;

    async function initializeConversation() {
      try {
        setIsLoading(true);
        setError(null);
        const id = await createOrGetConversation({ userId, userName, userEmail });
        if (isMounted) {
          setConversationId(id);
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Unable to initialize chat.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeConversation();

    return () => {
      isMounted = false;
    };
  }, [enabled, userEmail, userId, userName]);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribeMessages = subscribeToMessages(conversationId, setMessages);
    const unsubscribeConversation = subscribeToConversation(conversationId, setConversation);

    return () => {
      unsubscribeMessages();
      unsubscribeConversation();
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId) {
        throw new Error("Chat conversation is not ready.");
      }

      try {
        setIsSending(true);
        setError(null);
        await sendChatMessage({ conversationId, senderId: userId, senderName: userName, senderRole, text });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to send message.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, senderRole, userId, userName]
  );

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;

    try {
      await markConversationAsRead({ conversationId, readerRole: senderRole });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update read status.");
    }
  }, [conversationId, senderRole]);

  return {
    conversationId,
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    unreadCount: senderRole === "admin" ? conversation?.unreadByAdmin || 0 : conversation?.unreadByUser || 0,
    sendMessage,
    markAsRead,
  };
}
