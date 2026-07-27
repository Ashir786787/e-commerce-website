"use client";

import {
  Banknote,
  Building2,
  CreditCard,
} from "lucide-react";

export type CheckoutPaymentMethod =
  | "cod"
  | "card"
  | "bank";

interface PaymentMethodProps {
  value: CheckoutPaymentMethod;
  onChange: (
    value: CheckoutPaymentMethod
  ) => void;
}

const paymentMethods = [
  {
    value: "cod" as const,
    title: "Cash on Delivery",
    description: "Pay when your order arrives.",
    icon: Banknote,
    disabled: false,
  },
  {
    value: "card" as const,
    title: "Credit or Debit Card",
    description:
      "Pay securely through Stripe Checkout.",
    icon: CreditCard,
    disabled: false,
  },
  {
    value: "bank" as const,
    title: "Bank Transfer",
    description:
      "Direct bank transfer will be available soon.",
    icon: Building2,
    disabled: true,
  },
];

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
          Choose how you&apos;d like to pay for your
          order.
        </p>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected =
            value === method.value;

          return (
            <label
              key={method.value}
              className={`relative flex items-center gap-4 rounded-xl border p-4 transition ${
                method.disabled
                  ? "cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60"
                  : isSelected
                    ? "cursor-pointer border-indigo-500 bg-indigo-50/60 ring-1 ring-indigo-500"
                    : "cursor-pointer border-neutral-200 hover:border-indigo-300 hover:bg-indigo-50/40"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.value}
                checked={isSelected}
                disabled={method.disabled}
                onChange={() =>
                  onChange(method.value)
                }
                className="h-4 w-4 shrink-0 accent-indigo-600"
              />

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isSelected &&
                  !method.disabled
                    ? "bg-indigo-600 text-white"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-neutral-900">
                    {method.title}
                  </p>

                  {method.value === "card" && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                      Secure
                    </span>
                  )}

                  {method.disabled && (
                    <span className="rounded-full bg-neutral-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-600">
                      Coming Soon
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {method.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {value === "card" && (
        <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <p className="text-sm font-medium text-indigo-950">
            Secure Stripe payment
          </p>

          <p className="mt-1 text-xs leading-5 text-indigo-700">
            After creating your order, you will be
            redirected to Stripe&apos;s secure checkout
            page to complete payment.
          </p>
        </div>
      )}

      {value === "cod" && (
        <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-950">
            Cash payment
          </p>

          <p className="mt-1 text-xs leading-5 text-amber-700">
            Keep the exact amount ready when your order
            is delivered.
          </p>
        </div>
      )}
    </section>
  );
}