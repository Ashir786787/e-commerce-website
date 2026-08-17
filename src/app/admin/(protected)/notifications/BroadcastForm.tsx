"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, Send, Smartphone } from "lucide-react";

export default function BroadcastForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [reachable, setReachable] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    sent: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/notifications/broadcast", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReachable(data.data.reachableUsers);
      })
      .catch(() => {});
  }, []);

  async function handleSend() {
    setIsSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, body, url }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send notifications.");
      }

      setResult(data.data);
      toast.success(data.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSending(false);
    }
  }

  const inputClass =
    "mt-1 block h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Send Promotional Notification
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Broadcast a push notification to all users who have enabled
              notifications.
            </p>
          </div>
          {reachable !== null && (
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
              <BellRing className="h-4 w-4" />
              {reachable} reachable user{reachable === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-neutral-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Sale — Up to 40% Off"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-neutral-700">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="e.g. Shop our biggest summer deals before they're gone."
              rows={4}
              className="mt-1 block w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700">
              Link (optional)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/deals"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !title.trim() || !body.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Notification"}
          </button>
        </div>

        {result && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm text-neutral-500">Total</p>
              <p className="mt-1 text-lg font-bold text-neutral-950">
                {result.total}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm text-emerald-600">Sent</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {result.sent}
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">Failed</p>
              <p className="mt-1 text-lg font-bold text-red-700">
                {result.failed}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
          <Smartphone className="h-4 w-4" />
          Mobile Preview
        </div>

        <div className="mt-4 w-[280px] overflow-hidden rounded-[2.5rem] border-[6px] border-neutral-800 bg-neutral-900 shadow-xl">
          <div className="flex items-center justify-center bg-neutral-800 py-1.5">
            <div className="h-2 w-16 rounded-full bg-neutral-700" />
          </div>

          <div className="min-h-[480px] bg-gradient-to-b from-neutral-100 to-white p-4">
            <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                N
              </div>
              <span className="text-sm font-semibold text-neutral-900">
                NovaCart
              </span>
              <span className="ml-auto text-[10px] text-neutral-400">
                now
              </span>
            </div>

            {title || body ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                {title && (
                  <p className="text-sm font-bold text-neutral-900">
                    {title}
                  </p>
                )}
                {body && (
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                    {body}
                  </p>
                )}
                {url && url !== "/" && (
                  <p className="mt-2 text-[10px] text-indigo-500">
                    {url}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                  <BellRing className="h-5 w-5 text-neutral-400" />
                </div>
                <p className="mt-3 text-xs text-neutral-400">
                  Your notification preview will appear here
                </p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <div className="h-2 w-3/4 rounded-full bg-neutral-200" />
              <div className="h-2 w-1/2 rounded-full bg-neutral-200" />
              <div className="mt-4 h-24 rounded-lg bg-neutral-100" />
              <div className="h-2 w-2/3 rounded-full bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
