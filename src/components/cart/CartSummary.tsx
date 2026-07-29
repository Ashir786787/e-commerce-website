"use client";

import Link from "next/link";

type Summary = {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  totalItems: number;
};

type CartSummaryProps = {
  summary: Summary;
};

export default function CartSummary({
  summary,
}: CartSummaryProps) {
  return (
    <div className="sticky top-24 rounded-2xl border bg-background p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold">
        Order Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Items</span>
          <span>{summary.totalItems}</span>
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs. {summary.subtotal.toLocaleString("en-PK")}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery</span>
          <span>Rs. {summary.deliveryFee.toLocaleString("en-PK")}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax</span>
          <span>Rs. {summary.tax.toLocaleString("en-PK")}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount</span>
          <span>
            -Rs. {summary.discount.toLocaleString("en-PK")}
          </span>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>

          <span className="text-primary">
            Rs. {summary.total.toLocaleString("en-PK")}
          </span>
        </div>

        <Link
          href="/checkout"
          className="mt-6 block w-full rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}