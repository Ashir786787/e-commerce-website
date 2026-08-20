"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  BarChart3,
  MessageSquare,
  Users,
  TrendingUp,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(() => {
    return fetch("/api/admin/ai-analytics", { credentials: "include" })
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
      .catch(() => setError("Failed to load analytics."));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics().finally(() => setLoading(false));

    const interval = setInterval(() => {
      void fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  }

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
      iconBg: "bg-indigo-50 text-indigo-600",
      accent: "from-indigo-500 to-violet-400",
    },
    {
      title: "Today's Conversations",
      value: stats?.todayConversations || 0,
      icon: Users,
      iconBg: "bg-emerald-50 text-emerald-600",
      accent: "from-emerald-500 to-teal-400",
    },
    {
      title: "Total Messages",
      value: stats?.totalMessages || 0,
      icon: BarChart3,
      iconBg: "bg-violet-50 text-violet-600",
      accent: "from-violet-500 to-purple-400",
    },
    {
      title: "Avg Messages / Chat",
      value: stats?.avgMessagesPerConversation || 0,
      icon: TrendingUp,
      iconBg: "bg-amber-50 text-amber-600",
      accent: "from-amber-500 to-orange-400",
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
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`} />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-500">{card.title}</p>
                  <p className="mt-2 text-lg font-bold tracking-tight text-neutral-950">
                    {card.value}
                  </p>
                </div>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.iconBg}`}>
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Top Asked Topics
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Most common words in user messages
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
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-700 capitalize">
                        {topic.topic}
                      </p>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                        {topic.count}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-neutral-950">
                Recent Conversations
              </h2>
              <p className="mt-0.5 text-xs text-neutral-500">
                Latest AI assistant conversations
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {conversations.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-neutral-500">
                  No conversations yet.
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div key={conv.id}>
                  <button
                    type="button"
                    onClick={() => void handleExpand(conv.id)}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-neutral-50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                      {conv.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          {conv.name}
                        </p>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                          {conv.messageCount} msgs
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {conv.firstMessage}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-neutral-400">
                        <Clock className="h-3 w-3" />
                        {new Date(conv.lastActiveAt).toLocaleDateString()}
                      </span>
                      {expandedId === conv.id ? (
                        <ChevronUp className="h-4 w-4 text-neutral-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>
                  </button>

                  {expandedId === conv.id && (
                    <div className="border-t border-neutral-100 bg-neutral-50/50 px-6 py-4">
                      {loadingDetail ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                        </div>
                      ) : expandedMessages ? (
                        <div className="max-h-[400px] space-y-3 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                          {expandedMessages.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                  msg.role === "user"
                                    ? "rounded-br-md bg-indigo-600 text-white"
                                    : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800 shadow-sm"
                                }`}
                              >
                                <p className="mb-1 font-semibold">
                                  {msg.role === "user" ? "User" : "AI"}
                                </p>
                                <p className="whitespace-pre-wrap">
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
