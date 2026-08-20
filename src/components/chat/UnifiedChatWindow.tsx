"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Backpack,
  Clock,
  Dumbbell,
  Gem,
  Headphones,
  Home,
  MessageSquare,
  X,
} from "lucide-react";

import MessageInput from "@/components/chat/MessageInput";
import ProductRecommendationCard from "@/components/ai-assistant/ProductRecommendationCard";
import { useChat } from "@/hooks/useChat";
import {
  useAiAssistant,
  AI_QUICK_QUESTIONS,
  type AIAssistantMessage,
} from "@/hooks/useAiAssistant";
import type { ChatIdentity } from "@/lib/chat-identity";
import { subscribeToSession } from "@/services/session.service";
import type { ActiveSession, ChatMessage as HumanChatMessage } from "@/types/Chat";

type ChatMode = "ai" | "human";

type UnifiedMessage =
  | { kind: "ai"; id: string; role: "user" | "assistant"; content: string; createdAt: number; products?: AIAssistantMessage["products"]; isError?: boolean }
  | { kind: "human"; id: string; role: "user" | "assistant"; content: string; createdAt: number; senderName: string };

interface UnifiedChatWindowProps {
  identity: ChatIdentity;
  onGuestInfoSubmit?: (name: string, email: string) => void;
  onClose: () => void;
}

const CATEGORY_CHIPS = [
  { label: "Electronics", icon: Headphones, query: "Show me electronics" },
  { label: "Fashion", icon: () => <span className="text-xs">&#128084;</span>, query: "Show me fashion products" },
  { label: "Home", icon: Home, query: "Show me home and living products" },
  { label: "Beauty", icon: Gem, query: "Show me beauty products" },
  { label: "Sports", icon: Dumbbell, query: "Show me sports products" },
  { label: "Accessories", icon: Backpack, query: "Show me accessories" },
];

function AiBubble({ message }: { message: Extract<UnifiedMessage, { kind: "ai" }> }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="max-w-[82%] rounded-2xl rounded-tl-md border border-red-100 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700 shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <MessageSquare className="h-4 w-4" />
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

function HumanBubble({ message }: { message: Extract<UnifiedMessage, { kind: "human" }> }) {
  const isFromUser = message.role === "user";
  const initial = isFromUser ? "" : (message.senderName?.charAt(0)?.toUpperCase() || "S");

  return (
    <div className={`flex gap-2 ${isFromUser ? "justify-end" : "justify-start"}`}>
      {!isFromUser && (
        <div className="mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
          {initial}
        </div>
      )}
      <div className={`flex max-w-[75%] flex-col ${isFromUser ? "items-end" : "items-start"}`}>
        {!isFromUser && (
          <span className="mb-1 px-1 text-[11px] font-medium text-neutral-500">
            {message.senderName}
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isFromUser
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-neutral-200 bg-white text-neutral-900"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
        <MessageSquare className="h-4 w-4" />
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

function SessionBanner({ session }: { session: ActiveSession }) {
  const [remaining, setRemaining] = useState(Math.max(0, session.expiresAt - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = session.expiresAt - Date.now();
      if (diff <= 0) {
        setRemaining(0);
        clearInterval(interval);
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [session.expiresAt]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);

  if (remaining <= 0) return null;

  return (
    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3">
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <Clock className="h-3.5 w-3.5" />
        <span>
          Live support session with {session.adminName} — {mins}:{secs.toString().padStart(2, "0")} remaining
        </span>
      </div>
    </div>
  );
}

function SessionEndedBanner() {
  return (
    <div className="border-b border-blue-200 bg-blue-50 px-4 py-3">
      <div className="flex items-center justify-center gap-2 text-xs font-medium text-blue-800">
        ✅ Support session ended — AI assistant has resumed
      </div>
    </div>
  );
}

function mergeAndSort(aiMessages: AIAssistantMessage[], humanMessages: HumanChatMessage[]): UnifiedMessage[] {
  const unified: UnifiedMessage[] = [];

  for (const msg of aiMessages) {
    unified.push({
      kind: "ai",
      id: msg.id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
      products: msg.products,
      isError: msg.isError,
    });
  }

  for (const msg of humanMessages) {
    unified.push({
      kind: "human",
      id: msg.id,
      role: msg.senderRole === "user" ? "user" : "assistant",
      content: msg.text,
      createdAt: msg.createdAt,
      senderName: msg.senderName,
    });
  }

  unified.sort((a, b) => a.createdAt - b.createdAt);
  return unified;
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
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [sessionJustEnded, setSessionJustEnded] = useState(false);
  const wasInSessionRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const chatReady = !identity.isGuest || Boolean(identity.name);
  const isSessionActive = activeSession !== null && activeSession.expiresAt > Date.now();

  const {
    messages: aiMessages,
    isSending: aiSending,
    sendMessage: aiSendMessage,
    clearHistory,
  } = useAiAssistant();

  const {
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
    enabled: chatReady,
  });

  const unifiedMessages = useMemo(
    () => mergeAndSort(aiMessages, humanMessages),
    [aiMessages, humanMessages]
  );

  const hasUserMessage = aiMessages.some((m) => m.role === "user");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [unifiedMessages, aiSending, humanSending]);

  useEffect(() => {
    if (!chatReady) return;
    const unsubscribe = subscribeToSession(identity.id, setActiveSession);
    return unsubscribe;
  }, [chatReady, identity.id]);

  useEffect(() => {
    if (isSessionActive && mode === "ai") {
      setMode("human");
      markAsRead();
      wasInSessionRef.current = true;
    }
  }, [isSessionActive, mode, markAsRead]);

  useEffect(() => {
    if (!isSessionActive && wasInSessionRef.current) {
      wasInSessionRef.current = false;
      setSessionJustEnded(true);
      setMode("ai");
      const timer = setTimeout(() => setSessionJustEnded(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isSessionActive]);

  useEffect(() => {
    if (mode === "human" && chatReady) {
      markAsRead();
    }
  }, [mode, chatReady, markAsRead, humanMessages]);

  function handleClose() {
    clearHistory();
    onClose();
  }

  async function handleSend(text: string) {
    if (mode === "ai") {
      await aiSendMessage(text);
    } else {
      await humanSendMessage(text);
    }
  }

  function handleStartSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || !onGuestInfoSubmit || isStarting) return;
    setIsStarting(true);
    onGuestInfoSubmit(cleanName, email.trim());
    setIsStarting(false);
  }

  const showWelcome = !hasUserMessage && !aiSending && unifiedMessages.length === 0 && mode === "ai" && !isSessionActive;

  return (
    <section className="fixed bottom-20 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:right-6 sm:w-[380px]">
      {mode === "ai" && !isSessionActive ? (
        <header className="relative flex items-center justify-between border-b bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
              <MessageSquare className="h-5 w-5" />
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
              onClick={handleClose}
              aria-label="Close chat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>
      ) : (
        <header className="flex items-center justify-between border-b bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">
                {isSessionActive ? "Live Support" : "NovaCart Support"}
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <p className="text-xs text-white/80">
                  {isSessionActive ? `${activeSession.adminName} is online` : "We usually reply soon"}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close chat"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
      )}

      {isSessionActive && <SessionBanner session={activeSession} />}
      {sessionJustEnded && <SessionEndedBanner />}

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
          <div className="flex-1 overflow-y-auto bg-neutral-50/80 p-4" style={{ scrollbarWidth: "thin" }}>
            {showWelcome && (
              <div className="mb-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <p className="mt-3 text-base font-semibold text-neutral-900">
                  Hi! I&apos;m NovaCart AI
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Ask me about products, orders, deals, or anything NovaCart.
                </p>
                <p className="mt-1 text-[11px] leading-4 text-neutral-400">
                  Need a human? Just ask and I&apos;ll connect you to our team.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {CATEGORY_CHIPS.map((chip) => {
                    const Icon = chip.icon;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => void handleSend(chip.query)}
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
              {unifiedMessages.map((message) => {
                if (message.kind === "ai") {
                  return <AiBubble key={`ai-${message.id}`} message={message} />;
                }
                return <HumanBubble key={`human-${message.id}`} message={message} />;
              })}

              {aiSending && mode === "ai" && <TypingIndicator />}
              {humanSending && (
                <div className="flex justify-center py-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Sending...
                  </span>
                </div>
              )}
              {humanLoading && unifiedMessages.length === 0 && (
                <div className="flex justify-center py-8">
                  <p className="text-sm text-neutral-400">Loading support chat...</p>
                </div>
              )}
              {humanError && (
                <div className="flex justify-center py-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-medium text-red-700">
                    {humanError}
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showWelcome && (
              <div className="mt-4 flex flex-wrap gap-2">
                {AI_QUICK_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void handleSend(question)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <MessageInput
            onSend={handleSend}
            isSending={aiSending || humanSending}
            disabled={humanLoading}
          />
        </>
      )}
    </section>
  );
}
