"use client";

import { useSyncExternalStore } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = endOfDay.getTime() - now.getTime();

  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

let cached: TimeLeft | null = null;

function getSnapshot(): TimeLeft {
  const next = getTimeLeft();

  if (
    cached &&
    cached.hours === next.hours &&
    cached.minutes === next.minutes &&
    cached.seconds === next.seconds
  ) {
    return cached;
  }

  cached = next;
  return cached;
}

function getServerSnapshot() {
  return null;
}

function subscribe(onStoreChange: () => void) {
  const interval = setInterval(onStoreChange, 1000);
  return () => clearInterval(interval);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function CountdownTimer() {
  const time = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  if (!time) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-mono font-bold">
        <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">--</span>
        <span>:</span>
        <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">--</span>
        <span>:</span>
        <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">--</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-sm font-mono font-bold">
      <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">
        {pad(time.hours)}
      </span>
      <span className="text-primary">:</span>
      <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">
        {pad(time.minutes)}
      </span>
      <span className="text-primary">:</span>
      <span className="rounded bg-primary px-1.5 py-0.5 text-primary-foreground">
        {pad(time.seconds)}
      </span>
    </div>
  );
}
