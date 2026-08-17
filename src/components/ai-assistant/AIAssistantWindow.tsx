"use client";

import { useEffect, useRef } from "react";
import {
  Backpack,
  Dumbbell,
  Gem,
  Headphones,
  Home,
  RefreshCcw,
  Shirt,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import MessageInput from "@/components/chat/MessageInput";
import ProductRecommendationCard from "./ProductRecommendationCard";
import {
  AI_QUICK_QUESTIONS,
  useAiAssistant,
  type AIAssistantMessage,
} from "@/hooks/useAiAssistant";

interface AIAssistantWindowProps {
  onClose: () => void;
}

const CATEGORY_CHIPS = [
  { label: "Electronics", icon: Headphones, query: "Show me electronics" },
  { label: "Fashion", icon: Shirt, query: "Show me fashion products" },
  { label: "Home", icon: Home, query: "Show me home and living products" },
  { label: "Beauty", icon: Gem, query: "Show me beauty products" },
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

function ErrorBubble({
  message,
  onRetry,
}: {
  message: AIAssistantMessage;
  onRetry: () => void;
}) {
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

export default function AIAssistantWindow({ onClose }: AIAssistantWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { messages, isSending, sendMessage, retryLast, clearHistory } =
    useAiAssistant();

  const hasUserMessage = messages.some((message) => message.role === "user");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  function handleRetry() {
    void retryLast();
  }

  return (
    <section className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:right-6 sm:w-[380px]">
      <header className="relative flex items-center justify-between border-b bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">NovaCart AI Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs text-white/80">Always here to help</p>
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
            aria-label="Close AI assistant"
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
                    onClick={() => void sendMessage(chip.query)}
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
          {messages.map((message) =>
            message.role === "user" ? (
              <UserMessageBubble key={message.id} message={message} />
            ) : message.isError ? (
              <ErrorBubble
                key={message.id}
                message={message}
                onRetry={handleRetry}
              />
            ) : (
              <AssistantMessageBubble key={message.id} message={message} />
            )
          )}

          {isSending && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {!hasUserMessage && !isSending && (
          <div className="mt-4 flex flex-wrap gap-2">
            {AI_QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => void sendMessage(question)}
                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      <MessageInput onSend={sendMessage} isSending={isSending} maxLength={1000} />
    </section>
  );
}
