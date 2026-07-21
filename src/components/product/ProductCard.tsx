"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    discount?: number;
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK").format(price);
}

export default function ProductCard({ product }: ProductCardProps) {
  const { refreshCart } = useCart();
  const { refreshWishlist, isWishlisted } = useWishlist();

  const productIsWishlisted = isWishlisted(product.id);

  const handleAddToCart = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to add product."
        );
      }

      await refreshCart();
      toast.success("Product added to cart.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add product."
      );
    }
  };

  const toggleWishlist = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

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
            productId: product.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Something went wrong."
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
    <article className="group overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 block"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            loading="eager"
            sizes="(max-width: 640px) 100vw,
                   (max-width: 1024px) 50vw,
                   25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        {product.discount && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            -{product.discount}%
          </span>
        )}

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={
            productIsWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:scale-105"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              productIsWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
          />
        </button>
      </div>
      <div className="space-y-3 p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {product.category}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-lg font-semibold hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">
            {product.rating}
          </span>
          <span className="text-sm text-muted-foreground">
            ({product.reviews})
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-primary">
              Rs. {formatPrice(product.price)}
            </p>

            {product.originalPrice && (
              <p className="text-sm text-muted-foreground line-through">
                Rs. {formatPrice(product.originalPrice)}
              </p>
            )}
          </div>

          <Button
            size="icon"
            className="rounded-full"
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}