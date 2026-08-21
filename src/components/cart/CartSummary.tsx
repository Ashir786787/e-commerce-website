"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Tag, Package } from "lucide-react";

type CartProductSummary = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: Array<{ url?: string } | string>;
};

type CartItemData = {
  product: CartProductSummary;
  quantity: number;
  price: number;
};

type Summary = {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  totalItems: number;
};

type AppliedDiscount = {
  code: string;
  percent: number;
};

type CartSummaryProps = {
  summary: Summary;
  items?: CartItemData[];
  appliedDiscount?: AppliedDiscount | null;
  onApplyDiscount?: (code: string) => Promise<void>;
  onRemoveDiscount?: () => void;
  isApplyingDiscount?: boolean;
};

const FREE_DELIVERY_THRESHOLD = 5000;

function getImageUrl(images?: Array<{ url?: string } | string>): string {
  if (!images || images.length === 0) return "";
  const first = images[0];
  if (typeof first === "string") return first;
  return first.url || "";
}

export default function CartSummary({
  summary,
  items = [],
  appliedDiscount = null,
  onApplyDiscount,
  onRemoveDiscount,
  isApplyingDiscount = false,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = useState("");
  const progressToFreeDelivery = Math.min(
    (summary.subtotal / FREE_DELIVERY_THRESHOLD) * 100,
    100
  );
  const remainingForFree = Math.max(
    FREE_DELIVERY_THRESHOLD - summary.subtotal,
    0
  );

  async function handleApply() {
    if (!promoCode.trim() || !onApplyDiscount) return;
    await onApplyDiscount(promoCode.trim());
    setPromoCode("");
  }

  return (
    <div className="sticky top-24 space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-neutral-900">
          Order Summary
        </h2>

        {items.length > 0 && (
          <div className="mb-4 max-h-52 overflow-y-auto rounded-xl border border-neutral-100 bg-neutral-50/50">
            {items.map((item) => {
              const imgUrl = getImageUrl(item.product.images);
              return (
                <div
                  key={item.product._id}
                  className="flex items-center gap-3 px-3.5 py-3 border-b border-neutral-100 last:border-0"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-neutral-300" />
                      </div>
                    )}
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-neutral-900">
                      {item.product.name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Qty: {item.quantity} &times; Rs.{" "}
                      {item.price.toLocaleString("en-PK")}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-neutral-900">
                    Rs. {(item.price * item.quantity).toLocaleString("en-PK")}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">
              Subtotal ({summary.totalItems} item{summary.totalItems !== 1 ? "s" : ""})
            </span>
            <span className="font-medium text-neutral-900">
              Rs. {summary.subtotal.toLocaleString("en-PK")}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Delivery Fee</span>
            <span className="font-medium text-neutral-900">
              {summary.deliveryFee === 0 ? (
                <span className="text-emerald-600 font-semibold">Free</span>
              ) : (
                `Rs. ${summary.deliveryFee.toLocaleString("en-PK")}`
              )}
            </span>
          </div>

          {summary.tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Tax</span>
              <span className="font-medium text-neutral-900">
                Rs. {summary.tax.toLocaleString("en-PK")}
              </span>
            </div>
          )}

          {summary.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Discount</span>
              <span className="font-medium text-emerald-600">
                -Rs. {summary.discount.toLocaleString("en-PK")}
              </span>
            </div>
          )}

          <hr className="border-neutral-200" />

          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-neutral-900">
              Total
            </span>
            <span className="text-xl font-bold text-indigo-600">
              Rs. {summary.total.toLocaleString("en-PK")}
            </span>
          </div>
        </div>

        {onApplyDiscount && (
          <div className="mt-5 border-t border-neutral-200 pt-5">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Promo Code
            </p>
            {appliedDiscount ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    {appliedDiscount.code}
                  </span>
                  <span className="text-xs text-emerald-600">
                    ({appliedDiscount.percent}% off)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onRemoveDiscount}
                  className="text-xs font-medium text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) =>
                    setPromoCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter promo code"
                  className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
                <button
                  type="button"
                  onClick={() => void handleApply()}
                  disabled={isApplyingDiscount || !promoCode.trim()}
                  className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isApplyingDiscount ? "..." : "Apply"}
                </button>
              </div>
            )}
          </div>
        )}

        {summary.subtotal > 0 && summary.subtotal < FREE_DELIVERY_THRESHOLD && (
          <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-indigo-700">
                Rs. {remainingForFree.toLocaleString("en-PK")} away from free
                delivery
              </span>
              <span className="font-semibold text-indigo-600">
                {Math.round(progressToFreeDelivery)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-indigo-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progressToFreeDelivery}%` }}
              />
            </div>
          </div>
        )}

        <Link
          href="/checkout"
          className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Proceed to Checkout
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <Truck className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-900">
                Free Delivery
              </p>
              <p className="text-[11px] text-neutral-500">
                On orders over Rs. 5,000
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <RotateCcw className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-900">
                Easy Returns
              </p>
              <p className="text-[11px] text-neutral-500">
                7-day return policy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-900">
                Secure Checkout
              </p>
              <p className="text-[11px] text-neutral-500">
                SSL encrypted payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
