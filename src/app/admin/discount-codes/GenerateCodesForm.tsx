"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export default function GenerateCodesForm() {
  const [count, setCount] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [expiresAt, setExpiresAt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setGeneratedCodes(null);
    try {
      const body: Record<string, unknown> = { count, discountPercent };
      if (expiresAt) body.expiresAt = expiresAt;

      const res = await fetch("/api/admin/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Failed to generate");

      setGeneratedCodes(result.data.codes);
      toast.success(`Generated ${result.data.codes.length} codes`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }

  const inputClass = "mt-1 block h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  return (
    <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-950">Generate New Codes</h2>
          <p className="mt-1 text-sm text-neutral-500">Bulk-generate unique codes for promotions.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div>
          <label className="text-sm font-medium text-neutral-700">Count</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">Discount %</label>
          <input type="number" min={1} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Math.min(100, Math.max(1, Number(e.target.value))))} className={inputClass} />
        </div>
        <div>
          <label className="text-sm font-medium text-neutral-700">Expires (optional)</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputClass} />
        </div>
        <div className="flex items-end">
          <button type="button" onClick={handleGenerate} disabled={isGenerating || count < 1}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
      {generatedCodes && generatedCodes.length > 0 && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-semibold text-emerald-800">
            {generatedCodes.length} code{generatedCodes.length > 1 ? "s" : ""} generated:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {generatedCodes.map((code) => (
              <code key={code} className="rounded-lg bg-emerald-100 px-3 py-1.5 font-mono text-sm font-semibold text-emerald-900">{code}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}