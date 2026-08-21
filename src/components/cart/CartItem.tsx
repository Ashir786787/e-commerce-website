"use client";

import Link from "next/link";
import QuantitySelector from "./QuantitySelector";
import RemoveButton from "./RemoveButton";

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

type CartItemProps = {
  item: {
    product: CartProduct;
    quantity: number;
    price: number;
  };
  loading: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

function getImageUrl(images?: Array<ProductImage | string>): string {
  if (!images || images.length === 0)
    return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10";
  const first = images[0];
  if (typeof first === "string") return first;
  return first.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10";
}

export default function CartItem({
  item,
  loading,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  const { product, quantity, price } = item;
  const imageUrl = getImageUrl(product.images);
  const hasDiscount =
    product.originalPrice && product.originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! - price) / product.originalPrice!) * 100
      )
    : 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:gap-5 sm:p-5">
      <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
        <RemoveButton onRemove={onRemove} loading={loading} />
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-36 sm:w-36"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            -{discountPercent}%
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-16 sm:pr-20">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 text-sm font-semibold text-neutral-900 hover:text-indigo-600 sm:text-base"
          >
            {product.name}
          </Link>
          {product.brand && (
            <p className="mt-1 text-xs font-medium text-neutral-500">
              {product.brand}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-neutral-900">
              Rs. {price.toLocaleString("en-PK")}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                Rs. {product.originalPrice!.toLocaleString("en-PK")}
              </span>
            )}
          </div>

          <div className="mt-1.5">
            {product.stock === 0 ? (
              <span className="text-xs font-medium text-red-500">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-xs font-medium text-amber-600">
                Only {product.stock} left — order soon
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600">
                In Stock
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <QuantitySelector
            quantity={quantity}
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            loading={loading}
          />
          <div className="text-right">
            <p className="text-sm font-bold text-neutral-900">
              Rs. {(price * quantity).toLocaleString("en-PK")}
            </p>
            {quantity > 1 && (
              <p className="text-[11px] text-neutral-500">
                Rs. {price.toLocaleString("en-PK")} each
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
