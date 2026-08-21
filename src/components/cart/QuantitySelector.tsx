"use client";

import { Minus, Plus } from "lucide-react";

type QuantitySelectorProps = {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  loading?: boolean;
};

export default function QuantitySelector({
  quantity,
  onDecrease,
  onIncrease,
  loading = false,
}: QuantitySelectorProps) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        disabled={loading || quantity <= 1}
        onClick={onDecrease}
        className="flex size-9 items-center justify-center text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="min-w-[40px] text-center text-sm font-semibold tabular-nums text-neutral-900">
        {quantity}
      </span>

      <button
        type="button"
        disabled={loading}
        onClick={onIncrease}
        className="flex size-9 items-center justify-center text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
