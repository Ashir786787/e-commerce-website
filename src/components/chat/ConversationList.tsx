"use client";

import { Search, UserRound } from "lucide-react";

import type { ChatConversation } from "@/types/Chat";

interface ConversationListProps {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (conversation: ChatConversation) => void;
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-PK", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

export default function ConversationList({
  conversations,
  selectedConversationId,
  searchQuery,
  onSearchChange,
  onSelect,
}: ConversationListProps) {
  const term = searchQuery.trim().toLowerCase();
  const filteredConversations = conversations.filter((conversation) => {
    if (!term) return true;
    return (
      conversation.userName.toLowerCase().includes(term) ||
      conversation.userEmail.toLowerCase().includes(term) ||
      conversation.lastMessage.toLowerCase().includes(term)
    );
  });

  return (
    <aside className="flex min-h-0 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-4">
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

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <UserRound className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-4 font-semibold text-neutral-950">No conversations found</p>
            <p className="mt-2 text-sm text-neutral-500">Customer messages will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedConversationId === conversation.id;
              const initial = conversation.userName.charAt(0).toUpperCase() || "U";

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation)}
                  className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                    isSelected ? "bg-indigo-50" : "hover:bg-neutral-50"
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
        )}
      </div>
    </aside>
  );
}
