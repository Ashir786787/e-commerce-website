"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftToLine,
  Backpack,
  Bot,
  Dumbbell,
  Headphones,
  Home,
  RefreshCcw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import ChatMessage from "@/components/chat/ChatMessage";
import MessageDateDivider from "@/components/chat/MessageDateDivider";
import MessageInput from "@/components/chat/MessageInput";
import ProductRecommendationCard from "@/components/ai-assistant/ProductRecommendationCard";
import { useChat } from "@/hooks/useChat";
import {
  useAiAssistant,
  AI_QUICK_QUESTIONS,
  type AIAssistantMessage,
} from "@/hooks/useAiAssistant";
import type { ChatIdentity } from "@/lib/chat-identity";

type ChatMode = "ai" | "human";

interface UnifiedChatWindowProps {
  identity: ChatIdentity;
  onGuestInfoSubmit?: (name: string, email: string) => void;
  onClose: () => void;
}

const CATEGORY_CHIPS = [
  { label: "Electronics", icon: Headphones, query: "Show me electronics" },
  { label: "Fashion", icon: () => <span className="text-xs">&#128084;</span>, query: "Show me fashion products" },
  { label: "Home", icon: Home, query: "Show me home and living products" },
  { label: "Beauty", icon: Sparkles, query: "Show me beauty products" },
  { label: "Sports", icon: Dumbbell, query: "Show me sports products" },
  { label: "Accessories", icon: Backpack, query: "Show me accessories" },
];

function AssistantMessageBubble({ message }: { message: AIAssistantMessage }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="max-w-[82%] rounded-2xl rounded-tl-md border border-indigo-100 bg-indigo-50/40 px-4 py-3 text-sm leading-relaxed text-neutral-800 shadow-sm">
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.products.map((product) => (
              <ProductRecommendationCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorBubble({ message, onRetry }: { message: AIAssistantMessage; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="max-w-[82%] rounded-2xl rounded-tl-md border border-red-100 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700 shadow-sm">
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
        >
          <RefreshCcw className="h-3 w-3" />
          Try again
        </button>
      </div>
    </div>
  );
}

function UserMessageBubble({ message }: { message: AIAssistantMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[82%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-neutral-500">NovaCart AI is typing...</span>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-indigo-100 bg-white px-4 py-3 shadow-sm">
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
        </div>
      </div>
    </div>
  );
}

export default function UnifiedChatWindow({
  identity,
  onGuestInfoSubmit,
  onClose,
}: UnifiedChatWindowProps) {
  const [mode, setMode] = useState<ChatMode>("ai");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pendingHandoffRef = useRef<string | null>(null);

  const chatReady = !identity.isGuest || Boolean(identity.name);

  const {
    messages: aiMessages,
    isSending: aiSending,
    escalateTriggered,
    sendMessage: aiSendMessage,
    retryLast,
    clearHistory,
  } = useAiAssistant();

  const {
    conversationId,
    messages: humanMessages,
    isLoading: humanLoading,
    isSending: humanSending,
    error: humanError,
    sendMessage: humanSendMessage,
    markAsRead,
  } = useChat({
    userId: identity.id,
    userName: identity.name || "Guest",
    userEmail: identity.email,
    senderRole: "user",
    enabled: mode === "human" && chatReady,
  });

  const hasUserMessage = aiMessages.some((m) => m.role === "user");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, humanMessages, aiSending, humanSending]);

  useEffect(() => {
    if (mode === "human" && chatReady) {
      markAsRead();
    }
  }, [mode, chatReady, markAsRead, humanMessages]);

  useEffect(() => {
    if (mode === "human" && conversationId && pendingHandoffRef.current) {
      const message = pendingHandoffRef.current;
      pendingHandoffRef.current = null;
      void humanSendMessage(message);
    }
  }, [mode, conversationId, humanSendMessage]);

  useEffect(() => {
    if (escalateTriggered && mode === "ai") {
      handleEscalateToHuman();
    }
  }, [escalateTriggered, mode]);

  function handleRetry() {
    void retryLast();
  }

  function handleStartSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || !onGuestInfoSubmit || isStarting) return;
    setIsStarting(true);
    onGuestInfoSubmit(cleanName, email.trim());
    setIsStarting(false);
  }

  async function handleEscalateToHuman() {
    const topic =
      aiMessages
        .filter((m) => m.role === "user")
        .slice(-2)
        .map((m) => m.content)
        .join("; ") || "General inquiry";

    pendingHandoffRef.current = `[AI Handoff] User was chatting with AI about: "${topic}". Please assist them further.`;
    setMode("human");
  }

  return (
    <section className="fixed bottom-20 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:right-6 sm:w-[380px]">
      {mode === "ai" ? (
        <>
          <header className="relative flex items-center justify-between border-b bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">NovaCart Assistant</h2>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <p className="text-xs text-white/80">AI-powered help</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearHistory}
                aria-label="Clear chat history"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto bg-neutral-50/80 p-4">
            {!hasUserMessage && (
              <div className="mb-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="mt-3 text-base font-semibold text-neutral-900">
                  Hi! I&apos;m NovaCart AI
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Ask me about products, orders, deals, or anything NovaCart.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {CATEGORY_CHIPS.map((chip) => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => void aiSendMessage(chip.query)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <Icon className="h-3 w-3" />
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {aiMessages.map((message) =>
                message.role === "user" ? (
                  <UserMessageBubble key={message.id} message={message} />
                ) : message.isError ? (
                  <ErrorBubble key={message.id} message={message} onRetry={handleRetry} />
                ) : (
                  <AssistantMessageBubble key={message.id} message={message} />
                )
              )}
              {aiSending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {!hasUserMessage && !aiSending && (
              <div className="mt-4 flex flex-wrap gap-2">
                {AI_QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void aiSendMessage(question)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MessageInput onSend={aiSendMessage} isSending={aiSending} maxLength={1000} />
        </>
      ) : (
        <>
          <header className="flex items-center justify-between border-b bg-primary px-4 py-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMode("ai")}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10"
                title="Back to AI Assistant"
              >
                <ArrowLeftToLine className="h-4 w-4" />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold">NovaCart Support</h2>
                <p className="text-xs text-primary-foreground/75">We usually reply as soon as possible</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close support chat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {!chatReady ? (
            <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
              <div className="flex h-full items-center justify-center px-4">
                <div className="w-full text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Headphones className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold">Chat with NovaCart Support</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Tell us your name so we know who we&apos;re chatting with.
                  </p>
                  <form onSubmit={handleStartSubmit} className="mt-5 space-y-3 text-left">
                    <div>
                      <label htmlFor="unified-chat-name" className="text-xs font-medium text-muted-foreground">
                        Your name
                      </label>
                      <input
                        id="unified-chat-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ali Khan"
                        maxLength={80}
                        className="mt-1 block h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label htmlFor="unified-chat-email" className="text-xs font-medium text-muted-foreground">
                        Email (optional)
                      </label>
                      <input
                        id="unified-chat-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        maxLength={120}
                        className="mt-1 block h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isStarting || !name.trim()}
                      className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isStarting ? "Starting..." : "Start Chat"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
                {humanLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading support chat...</p>
                  </div>
                ) : humanError ? (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <p className="font-semibold text-destructive">{humanError}</p>
                  </div>
                ) : humanMessages.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-6 text-center">
                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Headphones className="h-6 w-6" />
                      </div>
                      <h3 className="mt-4 font-semibold">How can we help?</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Send us a message about your order, payment, or account.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {humanMessages.map((message, index) => {
                      const previous = humanMessages[index - 1];
                      const showDivider =
                        !previous ||
                        new Date(message.createdAt).toDateString() !==
                          new Date(previous.createdAt).toDateString();
                      return (
                        <div key={message.id}>
                          {showDivider && <MessageDateDivider timestamp={message.createdAt} />}
                          <ChatMessage message={message} currentUserRole="user" />
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <MessageInput
                onSend={humanSendMessage}
                isSending={humanSending}
                disabled={humanLoading}
              />
            </>
          )}
        </>
      )}
    </section>
  );
}
