"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import AddToCartButton from "./AddToCartButton";

interface ProductActionsProps {
  productId: string;
  stock: number;
}

export default function ProductActions({
  productId,
  stock,
}: ProductActionsProps) {
  const { refreshWishlist, isWishlisted } = useWishlist();

  const productIsWishlisted = isWishlisted(productId);

  const toggleWishlist = async () => {
    const wasWishlisted = productIsWishlisted;

    try {
      const response = await fetch(
        wasWishlisted
          ? "/api/wishlist/remove"
          : "/api/wishlist/add",
        {
          method: wasWishlisted ? "DELETE" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Wishlist action failed."
        );
      }

      await refreshWishlist();

      toast.success(
        wasWishlisted
          ? "Removed from wishlist."
          : "Added to wishlist."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <AddToCartButton
        productId={productId}
        disabled={stock <= 0}
      />

      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={toggleWishlist}
        className={`h-12 flex-1 ${
          productIsWishlisted
            ? "border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            : ""
        }`}
        aria-label={
          productIsWishlisted
            ? "Remove product from wishlist"
            : "Add product to wishlist"
        }
      >
        <Heart
          className={`mr-2 h-5 w-5 ${
            productIsWishlisted
              ? "fill-red-500 text-red-500"
              : ""
          }`}
        />

        {productIsWishlisted
          ? "Remove from Wishlist"
          : "Add to Wishlist"}
      </Button>
    </div>
  );
}
