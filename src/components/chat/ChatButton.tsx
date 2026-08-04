"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

import ChatWindow from "./ChatWindow";
import { useChat } from "@/hooks/useChat";

interface ChatButtonProps {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function ChatButton({ user }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, markAsRead } = useChat({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    senderRole: "user",
  });

  async function handleToggle() {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      await markAsRead();
    }
  }

  return (
    <>
      {isOpen && <ChatWindow user={user} onClose={() => setIsOpen(false)} />}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={isOpen ? "Close NovaCart support chat" : "Open NovaCart support chat"}
        className="fixed bottom-5 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 hover:opacity-95 sm:right-6"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}

        {!isOpen && unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
