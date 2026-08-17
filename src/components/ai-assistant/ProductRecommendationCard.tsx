"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";

import type { AIProductSuggestion } from "@/hooks/useAiAssistant";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK").format(price);
}

export default function ProductRecommendationCard({
  product,
}: {
  product: AIProductSuggestion;
}) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-indigo-600">
            {product.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">
          {product.name}
        </p>
        <p className="truncate text-xs text-neutral-500">
          {product.brand}
        </p>

        {product.category && (
          <span className="mt-0.5 inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
            {product.category}
          </span>
        )}

        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-primary">
            Rs. {formatPrice(product.price)}
          </span>

          {product.originalPrice &&
            product.originalPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                Rs. {formatPrice(product.originalPrice)}
              </span>
            )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        {product.rating > 0 && (
          <span className="flex items-center gap-0.5 text-xs font-medium text-neutral-600">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {product.rating}
            {product.reviewCount > 0 && ` (${product.reviewCount})`}
          </span>
        )}

        {outOfStock ? (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
            Out of stock
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-xs font-semibold text-indigo-600">
            View <ArrowUpRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </Link>
  );
}
