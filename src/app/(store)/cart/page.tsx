"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ShoppingCart, ArrowLeft, Truck, PackageOpen } from "lucide-react";

import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { useCart } from "@/context/CartContext";

type ProductImage = {
  url?: string;
  alt?: string;
};

type CartProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  stock: number;
  brand?: string;
  images?: Array<ProductImage | string>;
};

type CartItemData = {
  product: CartProduct;
  quantity: number;
  price: number;
};

type CartSummaryData = {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  totalItems: number;
};

type CartData = {
  _id?: string;
  items: CartItemData[];
  summary?: CartSummaryData;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: CartData;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { refreshCart } = useCart();

  const fetchCart = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/cart", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load cart.");
      }

      setCart(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading your cart."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = async (productId: string, quantity: number) => {
    setUpdatingId(productId);

    try {
      const response = await fetch("/api/cart/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setCart(result.data);
      await refreshCart();
    } catch {
      toast.error("Could not update quantity.");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const response = await fetch("/api/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setCart(result.data);
      await refreshCart();
      toast.success("Item removed from cart");
    } catch {
      toast.error("Could not remove item.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError("");
        const response = await fetch("/api/cart", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        const result: ApiResponse = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load cart.");
        }
        if (!cancelled) setCart(result.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading your cart."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const itemCount = cart?.summary?.totalItems ?? 0;

  return (
    <main>
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">
                Shopping Cart
              </h1>
              {!isLoading && cart && (
                <p className="text-sm text-neutral-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Continue Shopping</span>
          </Link>
        </div>

        {cart && cart.items.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/60 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 shrink-0 text-indigo-600" />
              <p className="text-sm text-indigo-800">
                {cart.summary && cart.summary.deliveryFee === 0 ? (
                  <span className="font-medium">
                    Your order qualifies for free delivery!
                  </span>
                ) : (
                  <>
                    Spend{" "}
                    <span className="font-semibold">
                      Rs.{" "}
                      {(5000 - (cart.summary?.subtotal ?? 0)).toLocaleString(
                        "en-PK"
                      )}
                    </span>{" "}
                    more for free delivery.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6">
          {isLoading && <CartLoadingState />}

          {!isLoading && error && (
            <CartErrorState message={error} onRetry={fetchCart} />
          )}

          {!isLoading && !error && cart && cart.items.length === 0 && (
            <EmptyCart />
          )}

          {!isLoading && !error && cart && cart.items.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                {cart.items
                  .filter((item) => item.product != null)
                  .map((item) => (
                    <CartItem
                      key={item.product._id}
                      item={item}
                      loading={updatingId === item.product._id}
                      onIncrease={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity + 1
                        )
                      }
                      onDecrease={() =>
                        updateQuantity(
                          item.product._id,
                          item.quantity - 1
                        )
                      }
                      onRemove={() => removeItem(item.product._id)}
                    />
                  ))}
              </div>

              {cart.summary && (
                <CartSummary
                  summary={cart.summary}
                  items={cart.items.filter((item) => item.product != null)}
                />
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function CartLoadingState() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-neutral-200 bg-white"
          />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-64 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
        <div className="h-36 animate-pulse rounded-2xl border border-neutral-200 bg-white" />
      </div>
    </div>
  );
}

function CartErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100">
        <PackageOpen className="h-7 w-7 text-red-500" />
      </div>
      <h2 className="mt-5 text-xl font-semibold text-neutral-900">
        Unable to load your cart
      </h2>
      <p className="mt-2 text-sm text-neutral-500">{message}</p>
      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-indigo-50">
        <ShoppingCart className="h-9 w-9 text-indigo-400" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-neutral-900">
        Your cart is empty
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-500">
        Looks like you haven&apos;t added any products yet. Start browsing to
        find something you love.
      </p>
      <Link
        href="/products"
        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <ShoppingCart className="h-4 w-4" />
        Start Shopping
      </Link>
    </div>
  );
}
