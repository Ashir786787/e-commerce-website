"use client";

import type { ChatMessage as ChatMessageType } from "@/types/Chat";

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserRole: "user" | "admin";
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) {
    return new Intl.DateTimeFormat("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ChatMessage({ message, currentUserRole }: ChatMessageProps) {
  const isOwnMessage = message.senderRole === currentUserRole;
  const initial = message.senderName.charAt(0).toUpperCase() || "?";

  return (
    <div className={`flex gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {!isOwnMessage && (
        <div className="mt-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
          {initial}
        </div>
      )}

      <div className={`flex max-w-[75%] flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
        {!isOwnMessage && (
          <span className="mb-1 px-1 text-[11px] font-medium text-neutral-500">
            {message.senderName}
          </span>
        )}

        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwnMessage
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-neutral-200 bg-white text-neutral-900"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
            {message.text}
          </p>
        </div>

        <div
          className={`mt-1 flex items-center gap-1.5 px-1 ${
            isOwnMessage ? "justify-end" : "justify-start"
          }`}
        >
          <span className="text-[11px] text-neutral-400">{formatTime(message.createdAt)}</span>
          {isOwnMessage && (
            <span className="text-[11px] text-primary/70">
              {message.read ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
