"use client";

import type { ChatMessage as ChatMessageType } from "@/types/Chat";

interface ChatMessageProps {
  message: ChatMessageType;
  currentUserRole: "user" | "admin";
}

export default function ChatMessage({ message, currentUserRole }: ChatMessageProps) {
  const isOwnMessage = message.senderRole === currentUserRole;

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
        }`}
      >
        <p className="break-words text-sm leading-relaxed">{message.text}</p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] opacity-70">
            {new Date(message.createdAt).toLocaleTimeString("en-PK", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {isOwnMessage && <span className="text-[11px] opacity-70">{message.read ? "✓✓" : "✓"}</span>}
        </div>
      </div>
    </div>
  );
}
