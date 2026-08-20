"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Clock, Headphones, Loader2, MessageCircle, Bot, PhoneOff } from "lucide-react";
import { toast } from "sonner";

import AiChatsPanel from "@/components/admin/AiChatsPanel";
import SessionDialog from "@/components/admin/SessionDialog";
import ChatMessage from "@/components/chat/ChatMessage";
import ConversationList from "@/components/chat/ConversationList";
import MessageDateDivider from "@/components/chat/MessageDateDivider";
import MessageInput from "@/components/chat/MessageInput";
import {
  markConversationAsRead,
  sendChatMessage,
  subscribeToConversations,
  subscribeToMessages,
} from "@/services/chat.service";
import {
  endSession,
  startSession,
  subscribeToSession,
} from "@/services/session.service";
import type { ActiveSession, ChatConversation, ChatMessage as ChatMessageType } from "@/types/Chat";

type Tab = "support" | "ai";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface MeResponse {
  success: boolean;
  message: string;
  data: AdminUser | null;
}

function useCountdown(expiresAt: number) {
  const [remaining, setRemaining] = useState(Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    if (expiresAt <= Date.now()) {
      setRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) {
        setRemaining(0);
        clearInterval(interval);
      } else {
        setRemaining(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return { minutes, seconds, expired: remaining <= 0 };
}

function SessionCountdown({ session }: { session: ActiveSession }) {
  const { minutes, seconds } = useCountdown(session.expiresAt);
  return (
    <span className="tabular-nums">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </span>
  );
}

export default function AdminMessagesPage() {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("support");
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);

  const isLoading = isLoadingAdmin || isLoadingConversations;

  const totalUnread = conversations.reduce(
    (sum, conversation) => sum + (conversation.unreadByAdmin || 0),
    0
  );

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setHasTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const response = await fetch("/api/auth/me", { method: "GET", credentials: "include", cache: "no-store" });
        const result = (await response.json()) as MeResponse;
        if (!response.ok || !result.success || !result.data || result.data.role !== "admin") {
          throw new Error("Admin account could not be loaded.");
        }
        setAdmin(result.data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load admin account.");
      } finally {
        setIsLoadingAdmin(false);
      }
    }
    loadAdmin();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToConversations((data) => {
      setConversations(data);
      setIsLoadingConversations(false);
      setSelectedConversation((current) => {
        if (!current) return null;
        return data.find((conversation) => conversation.id === current.id) || null;
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    const conversationId = selectedConversation.id;
    const unsubscribe = subscribeToMessages(conversationId, setMessages);
    markConversationAsRead({ conversationId, readerRole: "admin" }).catch(() => {
      toast.error("Unable to update message read status.");
    });
    return unsubscribe;
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!selectedConversation) {
      setActiveSession(null);
      return;
    }
    const unsubscribe = subscribeToSession(selectedConversation.id, setActiveSession);
    return unsubscribe;
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartSession = useCallback(async (durationMinutes: number) => {
    if (!admin || !selectedConversation) return;
    setIsStartingSession(true);
    try {
      await startSession({
        userId: selectedConversation.id,
        userName: selectedConversation.userName,
        adminId: admin.id,
        adminName: admin.fullName,
        durationMinutes,
      });
      await sendChatMessage({
        conversationId: selectedConversation.id,
        senderId: admin.id,
        senderName: "System",
        senderRole: "admin",
        text: `Support session started by ${admin.fullName}. Our team is now assisting you directly. The AI assistant has been paused.`,
      });
      toast.success(`Support session started for ${selectedConversation.userName}`);
    } catch {
      toast.error("Failed to start session.");
    } finally {
      setIsStartingSession(false);
    }
  }, [admin, selectedConversation]);

  const handleEndSession = useCallback(async () => {
    if (!selectedConversation || !activeSession) return;
    try {
      await endSession(selectedConversation.id, activeSession.sessionId);
      if (admin) {
        await sendChatMessage({
          conversationId: selectedConversation.id,
          senderId: admin.id,
          senderName: "System",
          senderRole: "admin",
          text: "Support session has ended. The AI assistant will resume shortly.",
        });
      }
      toast.success("Session ended.");
    } catch {
      toast.error("Failed to end session.");
    }
  }, [selectedConversation, activeSession, admin]);

  async function handleSendMessage(text: string) {
    if (!admin) throw new Error("Admin account is not ready.");
    if (!selectedConversation) throw new Error("Select a conversation first.");
    try {
      setIsSending(true);
      await sendChatMessage({
        conversationId: selectedConversation.id,
        senderId: admin.id,
        senderName: admin.fullName,
        senderRole: "admin",
        text,
      });
    } finally {
      setIsSending(false);
    }
  }

  function selectConversation(conversation: ChatConversation) {
    setMessages([]);
    setSelectedConversation(conversation);
  }

  if (isLoading && !hasTimedOut) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-neutral-200 bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-600" />
          <p className="mt-3 text-sm text-neutral-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Customer Support</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">Messages</h1>
        <p className="mt-1.5 text-neutral-600">Support chats and AI assistant conversations in one place.</p>
      </div>

      <div className="mt-6 flex gap-1 rounded-xl border border-neutral-200 bg-neutral-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "support"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          Support Chats
          {totalUnread > 0 && (
            <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === "ai"
              ? "bg-white text-neutral-950 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Bot className="h-4 w-4" />
          AI Chats
        </button>
      </div>

      {activeTab === "support" ? (
        <section className="mt-6 flex h-[calc(100dvh-16rem)] min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {hasTimedOut && (
            <div className="border-b border-neutral-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Realtime updates are taking longer than expected. Verify that the Firebase Realtime Database rules allow reading
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">conversations</code> and
              <code className="mx-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">messages</code>, then refresh the page.
            </div>
          )}
          <div className="grid min-h-0 flex-1 grid-rows-[1fr] lg:grid-cols-[340px_minmax(0,1fr)]">
            <div className={`min-h-0 h-full ${selectedConversation ? "hidden lg:block" : "block"}`}>
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id || null}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelect={selectConversation}
              />
            </div>

            <div className={`min-h-0 ${selectedConversation ? "flex" : "hidden lg:flex"} flex-col`}>
              {!selectedConversation ? (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <MessageCircle className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-neutral-950">Select a conversation</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                      Choose a customer from the conversation list to view their messages and reply.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedConversation(null)}
                        className="text-sm font-semibold text-indigo-600 lg:hidden"
                      >
                        Back
                      </button>

                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                          {selectedConversation.userName.charAt(0).toUpperCase()}
                        </div>
                        {activeSession ? (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 animate-pulse" />
                        ) : (
                          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-neutral-950">{selectedConversation.userName}</h2>
                        <p className="mt-1 truncate text-xs text-neutral-500">{selectedConversation.userEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {activeSession ? (
                        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <Clock className="h-3.5 w-3.5" />
                          <SessionCountdown session={activeSession} />
                          <button
                            type="button"
                            onClick={() => void handleEndSession()}
                            className="ml-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 transition hover:bg-red-100"
                          >
                            <PhoneOff className="h-3 w-3" />
                            End
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsSessionDialogOpen(true)}
                          disabled={isStartingSession}
                          className="hidden items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 sm:flex"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          Start Session
                        </button>
                      )}
                    </div>
                  </header>

                  {activeSession && (
                    <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-center text-xs font-medium text-emerald-800">
                      🔴 Live support session active — AI is paused for this user
                    </div>
                  )}

                  <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-5" style={{ scrollbarWidth: "thin" }}>
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <Headphones className="mx-auto h-10 w-10 text-neutral-300" />
                          <p className="mt-4 font-semibold text-neutral-950">No messages yet</p>
                          <p className="mt-2 text-sm text-neutral-500">Send the first support reply.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message, index) => {
                          const previous = messages[index - 1];
                          const showDivider =
                            !previous ||
                            new Date(message.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();
                          return (
                            <Fragment key={message.id}>
                              {showDivider && (
                                <MessageDateDivider timestamp={message.createdAt} />
                              )}
                              <ChatMessage message={message} currentUserRole="admin" />
                            </Fragment>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <MessageInput onSend={handleSendMessage} isSending={isSending} disabled={!admin} />

                  {!activeSession && (
                    <button
                      type="button"
                      onClick={() => setIsSessionDialogOpen(true)}
                      disabled={isStartingSession}
                      className="flex w-full items-center justify-center gap-2 border-t border-neutral-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 lg:hidden"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Start Support Session
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div className="mt-6">
          <AiChatsPanel />
        </div>
      )}

      {selectedConversation && (
        <SessionDialog
          userName={selectedConversation.userName}
          userEmail={selectedConversation.userEmail}
          isOpen={isSessionDialogOpen}
          onClose={() => setIsSessionDialogOpen(false)}
          onStart={handleStartSession}
        />
      )}
    </div>
  );
}
