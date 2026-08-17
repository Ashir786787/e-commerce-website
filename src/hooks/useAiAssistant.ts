"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AIProductSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  brand: string;
  stock: number;
  rating: number;
  reviewCount: number;
  image?: string;
  category?: string;
}

export interface AIAssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: AIProductSuggestion[];
  createdAt: number;
  isError?: boolean;
  escalate?: boolean;
}

export const AI_WELCOME_MESSAGE =
  "Hi there! Welcome to NovaCart! I'm your AI shopping assistant. I can help you find the perfect product across Electronics, Fashion, Beauty, Sports, Home & Living, and Accessories. How can I assist you today?";

export const AI_QUICK_QUESTIONS = [
  "Show me electronics",
  "Any fashion deals?",
  "Show me beauty products",
  "Recommend a gift under Rs 10,000",
];

const STORAGE_KEY = "novacart_ai_history";
const CONVERSATION_ID_KEY = "novacart_ai_conversation_id";
const STORAGE_LIMIT = 40;

function createMessage(
  role: AIAssistantMessage["role"],
  content: string,
  extra: Partial<AIAssistantMessage> = {}
): AIAssistantMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: Date.now(),
    ...extra,
  };
}

function loadHistory(): AIAssistantMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as AIAssistantMessage[];

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore corrupted storage and fall back to the welcome message.
  }

  return [createMessage("assistant", AI_WELCOME_MESSAGE)];
}

function getConversationId(): string {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  try {
    let id = localStorage.getItem(CONVERSATION_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CONVERSATION_ID_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function useAiAssistant() {
  const [messages, setMessages] = useState<AIAssistantMessage[]>(loadHistory);
  const [isSending, setIsSending] = useState(false);
  const [escalateTriggered, setEscalateTriggered] = useState(false);
  const lastUserContentRef = useRef<string>("");
  const pendingRef = useRef(false);
  const messagesRef = useRef(messages);
  const conversationIdRef = useRef<string>("");
  const escalateHandledRef = useRef(false);

  useEffect(() => {
    conversationIdRef.current = getConversationId();
  }, []);

  useEffect(() => {
    messagesRef.current = messages;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-STORAGE_LIMIT))
      );
    } catch {
      // Storage may be unavailable; the chat still works in memory.
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    const cleanContent = content.trim();

    if (!cleanContent || pendingRef.current) {
      return;
    }

    lastUserContentRef.current = cleanContent;
    pendingRef.current = true;
    setIsSending(true);

    setMessages((current) => [
      ...current,
      createMessage("user", cleanContent),
    ]);

    try {
      const history = messagesRef.current
        .filter((message) => !message.isError)
        .slice(-10)
        .map((message) => ({
          role: message.role,
          content: message.content,
        }));

      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: cleanContent,
          history,
          conversationId: conversationIdRef.current,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "The assistant could not respond."
        );
      }

      setMessages((current) => [
        ...current,
        createMessage("assistant", result.data.reply, {
          products: result.data.products,
          escalate: result.data.escalate,
        }),
      ]);

      if (result.data.escalate && !escalateHandledRef.current) {
        escalateHandledRef.current = true;
        setEscalateTriggered(true);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting the assistant.";

      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          `${message} Tap \"Try again\" to resend your last message.`,
          { isError: true }
        ),
      ]);
    } finally {
      pendingRef.current = false;
      setIsSending(false);
    }
  }, []);

  const retryLast = useCallback(async () => {
    const lastContent = lastUserContentRef.current;

    if (!lastContent) {
      return;
    }

    setMessages((current) =>
      current.filter((message) => !message.isError)
    );

    await sendMessage(lastContent);
  }, [sendMessage]);

  const clearHistory = useCallback(() => {
    lastUserContentRef.current = "";
    setMessages([createMessage("assistant", AI_WELCOME_MESSAGE)]);
    setEscalateTriggered(false);
    escalateHandledRef.current = false;
    conversationIdRef.current = crypto.randomUUID();
    try {
      localStorage.setItem(CONVERSATION_ID_KEY, conversationIdRef.current);
    } catch {
      // ignore
    }
  }, []);

  return {
    messages,
    isSending,
    escalateTriggered,
    sendMessage,
    retryLast,
    clearHistory,
  };
}
