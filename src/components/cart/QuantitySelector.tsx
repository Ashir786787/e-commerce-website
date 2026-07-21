"use client";

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
    <div className="flex items-center rounded-lg border">
      <button
        type="button"
        disabled={loading || quantity <= 1}
        onClick={onDecrease}
        className="px-3 py-2 text-lg font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        −
      </button>

      <span className="min-w-[48px] text-center font-medium">
        {quantity}
      </span>

      <button
        type="button"
        disabled={loading}
        onClick={onIncrease}
        className="px-3 py-2 text-lg font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
