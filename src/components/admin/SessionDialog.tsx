"use client";

import { useState } from "react";
import { Clock, Loader2, X } from "lucide-react";

interface SessionDialogProps {
  userName: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onStart: (durationMinutes: number) => Promise<void>;
}

const DURATION_OPTIONS = [
  { label: "5 min", minutes: 5 },
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
];

export default function SessionDialog({
  userName,
  userEmail,
  isOpen,
  onClose,
  onStart,
}: SessionDialogProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(60);
  const [customMinutes, setCustomMinutes] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  if (!isOpen) return null;

  const effectiveMinutes = customMinutes
    ? Math.min(60, Math.max(5, parseInt(customMinutes, 10) || 5))
    : selectedMinutes;

  async function handleStart() {
    setIsStarting(true);
    try {
      await onStart(effectiveMinutes);
      onClose();
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 transition hover:text-neutral-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-950">Start Support Session</h3>
            <p className="text-xs text-neutral-500">AI will be paused for this user</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-sm font-medium text-neutral-900">{userName}</p>
          <p className="mt-0.5 text-xs text-neutral-500">{userEmail}</p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium text-neutral-700">Session duration</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                type="button"
                onClick={() => {
                  setSelectedMinutes(option.minutes);
                  setCustomMinutes("");
                }}
                className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  !customMinutes && selectedMinutes === option.minutes
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <label htmlFor="custom-duration" className="text-xs font-medium text-neutral-500">
              Custom (minutes)
            </label>
            <input
              id="custom-duration"
              type="number"
              min={5}
              max={60}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="e.g. 10"
              className="mt-1 block h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={isStarting || effectiveMinutes < 5}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4" />
                Start Session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
