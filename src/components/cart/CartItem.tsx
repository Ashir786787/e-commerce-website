"use client";

import Image from "next/image";

import QuantitySelector from "./QuantitySelector";
import RemoveButton from "./RemoveButton";

type ProductImage = {
  url?: string;
  alt?: string;
};

type CartProduct = {
  _id: string;
  name: string;
  brand?: string;
  price: number;
  images?: Array<ProductImage | string>;
};

type CartItemProps = {
  item: {
    product: CartProduct;
    quantity: number;
    price: number;
  };
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  loading?: boolean;
};

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
  loading = false,
}: CartItemProps) {
  const image =
    typeof item.product.images?.[0] === "string"
      ? item.product.images[0]
      : item.product.images?.[0]?.url;

  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-5 md:flex-row">
        <div className="relative h-28 w-28 overflow-hidden rounded-xl border bg-muted">
          {image ? (
            <Image
              src={image}
              alt={item.product.name}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">
              📦
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {item.product.name}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Brand: {item.product.brand || "N/A"}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Price
              </p>

              <p className="font-semibold">
                ${item.price.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Quantity
              </p>

              <QuantitySelector
                quantity={item.quantity}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                loading={loading}
              />
            </div>

            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Subtotal
              </p>

              <p className="font-semibold text-primary">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <RemoveButton
              onRemove={onRemove}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}