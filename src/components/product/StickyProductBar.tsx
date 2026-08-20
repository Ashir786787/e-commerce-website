"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface StickyProductBarProps {
  productName: string;
  price: number;
  originalPrice?: number;
  productId: string;
  stock: number;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK").format(price);
}

export default function StickyProductBar({
  productName,
  price,
  originalPrice,
  productId,
  stock,
  triggerRef,
}: StickyProductBarProps) {
  const { refreshCart } = useCart();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerRef]);

  const handleAddToCart = async () => {
    if (stock <= 0) return;
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to add to cart.");
      }
      await refreshCart();
      toast.success(`${productName} added to cart.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart."
      );
    }
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-xl transition-all duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-foreground">
            {productName}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-primary">
              Rs. {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                Rs. {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="h-4 w-4" />
          {stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
