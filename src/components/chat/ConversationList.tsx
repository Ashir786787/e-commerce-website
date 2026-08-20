"use client";

import { useState } from "react";
import { ChevronDown, Search, UserRound } from "lucide-react";

import type { ChatConversation } from "@/types/Chat";

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (conversation: ChatConversation) => void;
}

const VISIBLE_LIMIT = 20;

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const today = new Date();

  const isToday =
    date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();

  if (isToday) {
    return new Intl.DateTimeFormat("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  searchQuery,
  onSearchChange,
  onSelect,
}: ConversationListProps) {
  const [visibleCount, setVisibleCount] = useState(VISIBLE_LIMIT);
  const [previousSearch, setPreviousSearch] = useState(searchQuery);

  if (searchQuery !== previousSearch) {
    setPreviousSearch(searchQuery);
    setVisibleCount(VISIBLE_LIMIT);
  }

  const term = searchQuery.trim().toLowerCase();
  const filteredConversations = conversations.filter((conversation) => {
    if (!term) return true;
    return (
      conversation.userName.toLowerCase().includes(term) || conversation.userEmail.toLowerCase().includes(term) || conversation.lastMessage.toLowerCase().includes(term)
    );
  });

  const visibleConversations = filteredConversations.slice(0, visibleCount);
  const hasMore = filteredConversations.length > visibleCount;

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-neutral-200 bg-white">
      <div className="shrink-0 border-b border-neutral-200 p-4">
        <h2 className="text-lg font-semibold text-neutral-950">Conversations</h2>
        <p className="mt-1 text-sm text-neutral-500">Customer support messages</p>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search customers..."
            className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {filteredConversations.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <UserRound className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-4 font-semibold text-neutral-950">No conversations found</p>
            <p className="mt-2 text-sm text-neutral-500">Customer messages will appear here.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-neutral-200">
              {visibleConversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.id;
                const initial = conversation.userName.charAt(0).toUpperCase() || "U";

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => onSelect(conversation)}
                    className={`flex w-full items-start gap-3 border-l-2 px-4 py-4 text-left transition ${
                      isSelected
                        ? "border-l-indigo-600 bg-indigo-50"
                        : "border-l-transparent hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                      {initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neutral-950">{conversation.userName}</p>
                          <p className="mt-1 truncate text-xs text-neutral-500">{conversation.userEmail}</p>
                        </div>
                        <p className="shrink-0 text-[11px] text-neutral-400">{formatTime(conversation.updatedAt)}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="truncate text-sm text-neutral-500">{conversation.lastMessage || "No messages yet"}</p>

                        {conversation.unreadByAdmin > 0 && (
                          <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                            {conversation.unreadByAdmin > 99 ? "99+" : conversation.unreadByAdmin}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasMore && (
              <div className="border-t border-neutral-200 p-3">
                <button
                  type="button"
                  onClick={() => setVisibleCount((count) => count + VISIBLE_LIMIT)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <ChevronDown className="h-4 w-4" />
                  Show more conversations
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
