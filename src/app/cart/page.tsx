"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
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
  stock: number;
  brand?: string;
  images?: Array<ProductImage | string>;
};

type CartItem = {
  product: CartProduct;
  quantity: number;
  price: number;
};

type CartSummary = {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  totalItems: number;
};

type CartData = {
  _id?: string;
  items: CartItem[];
  summary?: CartSummary;
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
      setIsLoading(true);
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your cart."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateQuantity = async (
    productId: string,
    quantity: number
  ) => {
    setUpdatingId(productId);

    try {
      const response = await fetch("/api/cart/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity,
        }),
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
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message);
      }

      setCart(result.data);
      await refreshCart();
    } catch {
      toast.error("Could not remove item.");
    }
  };

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">Your basket</p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Shopping Cart
            </h1>

            <p className="mt-2 text-muted-foreground">
              Review your products before proceeding to checkout.
            </p>
          </div>

          {isLoading && <CartLoadingState />}

          {!isLoading && error && (
            <CartErrorState message={error} onRetry={fetchCart} />
          )}

          {!isLoading && !error && cart && cart.items.length === 0 && (
            <EmptyCart />
          )}

          {!isLoading && !error && cart && cart.items.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-5">
                {cart.items.map((item) => (
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

              {cart.summary && <CartSummary summary={cart.summary} />}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function CartLoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-2xl border bg-background"
          />
        ))}
      </div>

      <div className="h-72 animate-pulse rounded-2xl border bg-background" />
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
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <h2 className="text-xl font-semibold">Unable to load your cart</h2>

      <p className="mt-2 text-sm text-muted-foreground">{message}</p>

      <button
        type="button"
        onClick={() => void onRetry()}
        className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-2xl border bg-background px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-3xl">
        🛒
      </div>

      <h2 className="mt-6 text-2xl font-semibold">Your cart is empty</h2>

      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        Browse our products and add something you like to your shopping cart.
      </p>

      <a
        href="/products"
        className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        Continue Shopping
      </a>
    </div>
  );
}
