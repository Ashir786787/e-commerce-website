"use client";

import { useEffect, useState } from "react";

import { subscribeToConversations } from "@/services/chat.service";

export function useUnreadChats() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToConversations((conversations) => {
      const total = conversations.reduce(
        (sum, conversation) => sum + (conversation.unreadByAdmin || 0),
        0
      );
      setUnreadCount(total);
    });

    return unsubscribe;
  }, []);

  return unreadCount;
}
