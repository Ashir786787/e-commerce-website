"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import DiscountCodeInput from "./DiscountCodeInput";

type ProductImage = {
  url?: string;
  alt?: string;
};

type CartProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images?: Array<ProductImage | string>;
};

type CartItem = {
  product: CartProduct;
  quantity: number;
  price: number;
};

type CartData = {
  items: CartItem[];
};

type CartResponse = {
  success: boolean;
  message: string;
  data: CartData;
};

type AppliedDiscount = {
  code: string;
  percent: number;
};

interface OrderSummaryProps {
  appliedDiscount: AppliedDiscount | null;
  onApplyDiscount: (code: string) => Promise<void>;
  onRemoveDiscount: () => void;
  isApplyingDiscount: boolean;
}

export default function OrderSummary({ appliedDiscount, onApplyDiscount, onRemoveDiscount, isApplyingDiscount }: OrderSummaryProps) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart", { method: "GET", credentials: "include", cache: "no-store" })
      .then(async (res) => {
        const result: CartResponse = await res.json();
        if (!res.ok || !result.success) throw new Error(result.message || "Could not load cart");
        return result;
      })
      .then((result) => { if (!cancelled) setCart(result.data); })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load"); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="h-6 w-32 animate-pulse rounded bg-neutral-100" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-5 animate-pulse rounded bg-neutral-100" />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-neutral-900">Could not load summary</h2>
        <p className="mt-2 text-sm text-neutral-500">{error}</p>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-neutral-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-neutral-500">Add products before checking out.</p>
        <Link href="/products" className="mt-5 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white">Browse Products</Link>
      </section>
    );
  }

  const validItems = cart.items.filter((item) => item.product);
  const subtotal = validItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 5000 ? 0 : 300;
  const discountAmount = appliedDiscount ? Math.round((subtotal * appliedDiscount.percent) / 100) : 0;
  const total = subtotal + deliveryFee - discountAmount;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Summary</p>
        <h2 className="text-2xl font-semibold text-neutral-950">Order Summary</h2>
      </div>
      <div className="space-y-1 border-b border-neutral-200 pb-4">
        {validItems.map((item) => (
          <div key={item.product._id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-900">{item.product.name}</p>
              <p className="mt-1 text-xs text-neutral-500">Qty: {item.quantity}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-neutral-900">Rs. {(item.price * item.quantity).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3 border-t border-neutral-200 pt-4">
        <SummaryRow label="Subtotal" value={subtotal} />
        <SummaryRow label="Delivery" value={deliveryFee} />
        {discountAmount > 0 && <SummaryRow label={`Discount (${appliedDiscount!.percent}%)`} value={-discountAmount} />}
      </div>
      <div className="mt-4 border-t border-neutral-200 pt-4">
        <DiscountCodeInput appliedDiscount={appliedDiscount} onApply={onApplyDiscount} onRemove={onRemoveDiscount} isApplying={isApplyingDiscount} />
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-4">
        <span className="text-base font-semibold text-neutral-950">Total</span>
        <span className="text-xl font-bold text-indigo-600">Rs. {total.toLocaleString()}</span>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value < 0 ? "- " : ""}Rs. {Math.abs(value).toLocaleString()}</span>
    </div>
  );
}