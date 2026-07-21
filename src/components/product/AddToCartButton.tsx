"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  productId: string;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  disabled = false,
}: AddToCartButtonProps) {
  const { refreshCart } = useCart();

  const handleAddToCart = async () => {
    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add product to cart.");
      }

      await refreshCart();

      toast.success("Product added to cart.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add product to cart."
      );
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      className="h-12 flex-1"
      disabled={disabled}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      Add to Cart
    </Button>
  );
}
