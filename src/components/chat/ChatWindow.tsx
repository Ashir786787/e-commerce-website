"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Headphones, Loader2, Send, X } from "lucide-react";

import ChatMessage from "./ChatMessage";
import MessageDateDivider from "./MessageDateDivider";
import MessageInput from "./MessageInput";
import { useChat } from "@/hooks/useChat";
import type { ChatIdentity } from "@/lib/chat-identity";

interface ChatWindowProps {
  identity: ChatIdentity;
  onGuestInfoSubmit?: (name: string, email: string) => void;
  onClose: () => void;
}

export default function ChatWindow({ identity, onGuestInfoSubmit, onClose }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const chatReady = !identity.isGuest || Boolean(identity.name);
  const { messages, isLoading, isSending, error, sendMessage, markAsRead } = useChat({
    userId: identity.id,
    userName: identity.name || "Guest",
    userEmail: identity.email,
    senderRole: "user",
    enabled: chatReady,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatReady) {
      markAsRead();
    }
  }, [messages, markAsRead, chatReady]);

  function handleStartSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanName = name.trim();
    if (!cleanName || !onGuestInfoSubmit || isStarting) {
      return;
    }

    setIsStarting(true);
    onGuestInfoSubmit(cleanName, email.trim());
    setIsStarting(false);
  }

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

      {!chatReady ? (
        <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
          <div className="flex h-full items-center justify-center px-4">
            <div className="w-full text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Headphones className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold">Chat with NovaCart Support</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Tell us your name so we know who we&apos;re chatting with. Add an email if you&apos;d like a
                reply sent there.
              </p>

              <form onSubmit={handleStartSubmit} className="mt-5 space-y-3 text-left">
                <div>
                  <label htmlFor="chat-guest-name" className="text-xs font-medium text-muted-foreground">
                    Your name
                  </label>
                  <input
                    id="chat-guest-name"
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Ali Khan"
                    maxLength={80}
                    className="mt-1 block h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label htmlFor="chat-guest-email" className="text-xs font-medium text-muted-foreground">
                    Email (optional)
                  </label>
                  <input
                    id="chat-guest-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    maxLength={120}
                    className="mt-1 block h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isStarting || !name.trim()}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isStarting ? "Starting..." : "Start Chat"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
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
                    new Date(message.createdAt).toDateString() !== new Date(previous.createdAt).toDateString();

                  return (
                    <Fragment key={message.id}>
                      {showDivider && <MessageDateDivider timestamp={message.createdAt} />}
                      <ChatMessage message={message} currentUserRole="user" />
                    </Fragment>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <MessageInput onSend={sendMessage} isSending={isSending} disabled={isLoading} />
        </>
      )}
    </section>
  );
}
