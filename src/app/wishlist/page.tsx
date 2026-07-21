"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface WishlistProduct {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  images: { url: string; publicId?: string }[];
  brand?: string;
  stock?: number;
}

export default function WishlistPage() {
  const {
    wishlist,
    refreshWishlist,
    totalItems,
  } = useWishlist();

  const { refreshCart } = useCart();

  const products: WishlistProduct[] = wishlist?.products ?? [];

  async function removeProduct(productId: string) {
    try {
      const response = await fetch("/api/wishlist/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to remove product."
        );
      }

      await refreshWishlist();
      toast.success("Product removed from wishlist.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  async function moveToCart(productId: string) {
    try {
      const cartResponse = await fetch("/api/cart/add", {
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

      const cartData = await cartResponse.json();

      if (!cartResponse.ok || !cartData.success) {
        throw new Error(
          cartData.message || "Failed to add product to cart."
        );
      }

      const wishlistResponse = await fetch(
        "/api/wishlist/remove",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            productId,
          }),
        }
      );

      const wishlistData = await wishlistResponse.json();

      if (!wishlistResponse.ok || !wishlistData.success) {
        throw new Error(
          wishlistData.message ||
            "Product was added to cart, but could not be removed from wishlist."
        );
      }

      await Promise.all([
        refreshWishlist(),
        refreshCart(),
      ]);

      toast.success("Product moved to cart.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  }

  if (products.length === 0) {
    return (
      <main className="min-h-[65vh] px-4 py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-50">
            <Heart className="h-9 w-9 text-violet-600" />
          </div>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-violet-600">
            Your Wishlist
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Your wishlist is empty
          </h1>

          <p className="mt-4 max-w-md text-slate-600">
            Save products you love and return to them whenever
            you are ready.
          </p>

          <Link
            href="/products"
            className="mt-8 rounded-xl bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-700"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
            Saved Products
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                My Wishlist
              </h1>

              <p className="mt-2 text-slate-600">
                {totalItems} saved{" "}
                {totalItems === 1 ? "product" : "products"}
              </p>
            </div>

            <Link
              href="/products"
              className="text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const hasDiscount =
              product.originalPrice &&
              product.originalPrice > product.price;

            return (
              <article
                key={product._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <Link
                  href={
                    product.slug
                      ? `/products/${product.slug}`
                      : `/products/${product._id}`
                  }
                  className="block"
                >
                  <div className="relative aspect-square bg-slate-100">
                    <Image
                      src={
                        product.images?.[0]?.url ||
                        "/products/placeholder.jpg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </Link>

                <div className="p-5">
                  {product.brand && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                      {product.brand}
                    </p>
                  )}

                  <Link
                    href={
                      product.slug
                        ? `/products/${product.slug}`
                        : `/products/${product._id}`
                    }
                  >
                    <h2 className="mt-2 line-clamp-2 min-h-12 text-lg font-semibold text-slate-950 hover:text-violet-600">
                      {product.name}
                    </h2>
                  </Link>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-950">
                      Rs. {product.price.toLocaleString("en-PK")}
                    </span>

                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through">
                        Rs. {product.originalPrice?.toLocaleString("en-PK")}
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-2 text-sm font-medium ${
                      (product.stock ?? 0) > 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {(product.stock ?? 0) > 0
                      ? "In stock"
                      : "Out of stock"}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        moveToCart(product._id)
                      }
                      disabled={(product.stock ?? 0) < 1}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Move to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeProduct(product._id)
                      }
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
