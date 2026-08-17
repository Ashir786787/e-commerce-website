"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface AiStats {
  totalConversations: number;
  todayConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
}

interface Topic {
  topic: string;
  count: number;
}

interface Conversation {
  id: string;
  name: string;
  messageCount: number;
  firstMessage: string;
  createdAt: string;
  lastActiveAt: string;
}

export default function AiChatsPanel() {
  const [stats, setStats] = useState<AiStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<
    { role: string; content: string; createdAt: string }[] | null
  >(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ai-analytics", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data.stats);
          setTopics(data.data.topTopics);
          setConversations(data.data.conversations);
        } else {
          setError(data.message || "Failed to load analytics.");
        }
      })
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  async function handleExpand(conversationId: string) {
    if (expandedId === conversationId) {
      setExpandedId(null);
      setExpandedMessages(null);
      return;
    }

    setExpandedId(conversationId);
    setLoadingDetail(true);

    try {
      const res = await fetch(
        `/api/admin/ai-analytics?conversationId=${conversationId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success && data.data.conversation) {
        setExpandedMessages(data.data.conversation.messages);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Conversations",
      value: stats?.totalConversations || 0,
      icon: MessageSquare,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Today's Conversations",
      value: stats?.todayConversations || 0,
      icon: Users,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Total Messages",
      value: stats?.totalMessages || 0,
      icon: BarChart3,
      color: "bg-violet-100 text-violet-600",
    },
    {
      title: "Avg Messages / Chat",
      value: stats?.avgMessagesPerConversation || 0,
      icon: TrendingUp,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-500">{card.title}</p>
                  <p className="mt-2 text-lg font-bold text-neutral-950">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-semibold text-neutral-950">
                Top Asked Topics
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Most common words in user messages.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {topics.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No conversation data yet.
              </p>
            ) : (
              topics.map((topic) => {
                const maxCount = topics[0]?.count || 1;
                const width = Math.max((topic.count / maxCount) * 100, 10);

                return (
                  <div key={topic.topic}>
                    <div className="mb-1 flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-700 capitalize">
                        {topic.topic}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {topic.count}
                      </p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-semibold text-neutral-950">
            Recent Conversations
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Latest AI assistant conversations. Click to expand.
          </p>

          <div className="mt-5 space-y-3">
            {conversations.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No conversations yet.
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className="rounded-xl border border-neutral-200 transition hover:border-indigo-200"
                >
                  <button
                    type="button"
                    onClick={() => void handleExpand(conv.id)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          {conv.name}
                        </p>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                          {conv.messageCount} msgs
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {conv.firstMessage}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {new Date(conv.lastActiveAt).toLocaleDateString()}
                    </span>
                  </button>

                  {expandedId === conv.id && (
                    <div className="border-t border-neutral-100 bg-neutral-50 p-4">
                      {loadingDetail ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        </div>
                      ) : expandedMessages ? (
                        <div className="space-y-3">
                          {expandedMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                                  msg.role === "user"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-neutral-800 border border-neutral-200"
                                }`}
                              >
                                <p className="font-medium">
                                  {msg.role === "user" ? "User" : "AI"}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap">
                                  {msg.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
