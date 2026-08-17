"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface MessageInputProps {
  onSend: (message: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export default function MessageInput({
  onSend,
  isSending,
  disabled = false,
  maxLength = 2000,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();
    if (!cleanMessage || isSending || disabled) {
      return;
    }

    try {
      await onSend(cleanMessage);
      setMessage("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send message.");
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);

    const textarea = event.currentTarget;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t bg-background p-3">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          maxLength={maxLength}
          value={message}
          disabled={disabled || isSending}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={disabled || isSending || !message.trim()}
          aria-label="Send message"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Press Enter to send. Use Shift + Enter for a new line.
        </p>
        <p className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
          {message.length}/{maxLength}
        </p>
      </div>
    </form>
  );
}
