"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

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
        throw new Error(result.message || "Failed to add product.");
      }

      await refreshCart();

      toast.success("Product added to cart.");
    } catch (error) {
      toast.error("Failed to add product.");
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
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <Heart className="h-4 w-4" />
        </Button>
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
