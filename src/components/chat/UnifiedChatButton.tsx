"use client";

import { useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";

import UnifiedChatWindow from "./UnifiedChatWindow";
import { useChat } from "@/hooks/useChat";
import {
  createGuestChatIdentity,
  readGuestChatIdentity,
  saveGuestChatInfo,
  type ChatIdentity,
} from "@/lib/chat-identity";

export interface ChatUser {
  id: string;
  fullName: string;
  email: string;
}

interface UnifiedChatButtonProps {
  user?: ChatUser | null;
}

export default function UnifiedChatButton({ user }: UnifiedChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [guest, setGuest] = useState<ChatIdentity | null>(() =>
    user ? null : { ...(readGuestChatIdentity() ?? createGuestChatIdentity()), isGuest: true }
  );

  const identity: ChatIdentity | null = user
    ? { id: user.id, name: user.fullName, email: user.email, isGuest: false }
    : guest;

  const chatReady = Boolean(identity?.name);
  const { unreadCount, markAsRead } = useChat({
    userId: identity?.id ?? "",
    userName: identity?.name ?? "Guest",
    userEmail: identity?.email ?? "",
    senderRole: "user",
    enabled: chatReady,
  });

  async function handleToggle() {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      await markAsRead();
    }
  }

  function handleGuestInfoSubmit(name: string, email: string) {
    setGuest({ ...saveGuestChatInfo(name, email), isGuest: true });
  }

  return (
    <>
      {isOpen && identity && (
        <UnifiedChatWindow
          identity={identity}
          onGuestInfoSubmit={identity.isGuest ? handleGuestInfoSubmit : undefined}
          onClose={() => setIsOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? "Close NovaCart chat" : "Open NovaCart chat"}
        title="Chat with NovaCart"
        className="fixed bottom-5 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl transition hover:scale-105 hover:opacity-95 sm:right-6"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-gradient-to-br from-indigo-400 to-violet-400 opacity-30" />
        )}
        {isOpen ? (
          <X className="relative h-6 w-6" />
        ) : (
          <MessageCircle className="relative h-6 w-6" />
        )}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
