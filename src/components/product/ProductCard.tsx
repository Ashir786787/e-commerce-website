"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Heart, ShoppingCart, Star, Truck } from "lucide-react";
import { toast } from "sonner";

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
  priority?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK").format(price);
}

function ProductCard({ product, priority }: ProductCardProps) {
  const { refreshCart } = useCart();
  const { refreshWishlist, isWishlisted } = useWishlist();

  const productIsWishlisted = isWishlisted(product.id);

  const savingsAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  const handleAddToCart = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const response = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add product.");
      }

      await refreshCart();
      toast.success("Added to cart");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add product."
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
        wasWishlisted ? "/api/wishlist/remove" : "/api/wishlist/add",
        {
          method: wasWishlisted ? "DELETE" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }

      await refreshWishlist();
      toast.success(
        wasWishlisted ? "Removed from wishlist." : "Added to wishlist."
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-muted">
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-0 block"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover/card:scale-105"
          />
        </Link>

        <div className="absolute left-2 top-2 z-10 flex flex-wrap items-center gap-1">
          {product.discount && product.discount > 0 && (
            <span className="inline-flex items-center rounded bg-red-600 px-1.5 py-px text-[10px] font-bold leading-5 text-white">
              -{product.discount}%
            </span>
          )}
          {savingsAmount > 0 && (
            <span className="inline-flex items-center rounded bg-emerald-600 px-1.5 py-px text-[10px] font-bold leading-5 text-white">
              Save Rs. {formatPrice(savingsAmount)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={
            productIsWishlisted
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition hover:scale-110 hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              productIsWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
          {product.category}
        </p>

        <Link
          href={`/products/${product.slug}`}
          className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition hover:text-primary"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-700">
              {product.rating}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviews})
          </span>
        </div>

        {product.price >= 5000 && (
          <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
            <Truck className="h-3 w-3" />
            Free Delivery
          </div>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-foreground">
              Rs. {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                Rs. {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
