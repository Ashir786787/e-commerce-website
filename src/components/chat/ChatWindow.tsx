"use client";

import { Fragment, useEffect, useRef } from "react";
import { Headphones, Loader2, X } from "lucide-react";

import ChatMessage from "./ChatMessage";
import MessageDateDivider from "./MessageDateDivider";
import MessageInput from "./MessageInput";
import { useChat } from "@/hooks/useChat";

interface ChatWindowProps {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  onClose: () => void;
}

export default function ChatWindow({ user, onClose }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { messages, isLoading, isSending, error, sendMessage, markAsRead } = useChat({
    userId: user.id,
    userName: user.fullName,
    userEmail: user.email,
    senderRole: "user",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    markAsRead();
  }, [messages, markAsRead]);

  return (
    <section className="fixed bottom-20 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl sm:right-6 sm:w-[380px]">
      <header className="flex items-center justify-between border-b bg-primary px-4 py-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Headphones className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">NovaCart Support</h2>
            <p className="text-xs text-primary-foreground/75">We usually reply as soon as possible</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close support chat"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Loading support chat...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <div>
              <p className="font-semibold text-destructive">Unable to load chat</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Headphones className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold">How can we help?</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Send us a message about your order, payment, account, or any other NovaCart question.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => {
              const previous = messages[index - 1];
              const showDivider =
                !previous ||
                new Date(message.createdAt).toDateString() !==
                  new Date(previous.createdAt).toDateString();

              return (
                <Fragment key={message.id}>
                  {showDivider && (
                    <MessageDateDivider timestamp={message.createdAt} />
                  )}
                  <ChatMessage message={message} currentUserRole="user" />
                </Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <MessageInput onSend={sendMessage} isSending={isSending} disabled={isLoading} />
    </section>
  );
}
