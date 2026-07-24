"use client";

interface PaymentMethodProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PaymentMethod({
  value,
  onChange,
}: PaymentMethodProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Payment
        </p>
        <h2 className="text-2xl font-semibold text-neutral-950">
          Payment Method
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Choose how you&apos;d like to pay for your order.
        </p>
      </div>
      <div className="space-y-4">
        <label
          className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
            value === "cod"
              ? "border-indigo-500 bg-indigo-50/50"
              : "border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/40"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={value === "cod"}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 accent-indigo-600"
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">Cash on Delivery</p>
            <p className="text-xs text-neutral-500">
              Pay when your order arrives
            </p>
          </div>
        </label>
      </div>
    </section>
  );
}
