"use client";

import { useState } from "react";

type AppliedDiscount = {
  code: string;
  percent: number;
};

interface DiscountCodeInputProps {
  appliedDiscount: AppliedDiscount | null;
  onApply: (code: string) => Promise<void>;
  onRemove: () => void;
  isApplying: boolean;
}

export default function DiscountCodeInput({ appliedDiscount, onApply, onRemove, isApplying }: DiscountCodeInputProps) {
  const [code, setCode] = useState("");

  if (appliedDiscount) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-green-700">{appliedDiscount.code}</span>
          <span className="text-xs text-green-600">({appliedDiscount.percent}% off)</span>
        </div>
        <button type="button" onClick={onRemove} className="text-xs font-medium text-red-500 hover:text-red-700">Remove</button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Discount code"
        className="block flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        type="button"
        onClick={async () => { if (!code.trim()) return; await onApply(code.trim()); setCode(""); }}
        disabled={isApplying || !code.trim()}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isApplying ? "..." : "Apply"}
      </button>
    </div>
  );
}