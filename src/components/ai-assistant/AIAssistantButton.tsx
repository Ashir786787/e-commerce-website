"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

import AIAssistantWindow from "./AIAssistantWindow";

export default function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && <AIAssistantWindow onClose={() => setIsOpen(false)} />}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={
          isOpen
            ? "Close NovaCart AI assistant"
            : "Open NovaCart AI assistant"
        }
        title="Ask AI Assistant"
        className="fixed bottom-24 right-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xl transition hover:scale-105 hover:opacity-95 sm:right-6"
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full animate-ping bg-gradient-to-br from-indigo-400 to-violet-400 opacity-30" />
        )}
        {isOpen ? (
          <X className="relative h-6 w-6" />
        ) : (
          <Sparkles className="relative h-6 w-6" />
        )}
      </button>
    </>
  );
}
