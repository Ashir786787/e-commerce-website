"use client";

interface PlaceOrderButtonProps {
  isLoading: boolean;
  disabled?: boolean;
}

export default function PlaceOrderButton({
  isLoading,
  disabled,
}: PlaceOrderButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? "Placing order..." : "Place Order"}
    </button>
  );
}
