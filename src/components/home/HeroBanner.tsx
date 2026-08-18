"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface TrendingProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  discount: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK").format(price);
}

const FALLBACK_IMAGE =
  "https://placehold.co/1200x600/1a1a2e/ffffff?text=NovaCart";

export default function HeroBanner() {
  const [products, setProducts] = useState<TrendingProduct[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { refreshCart } = useCart();
  const { refreshWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    fetch("/api/home/trending")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    if (products.length === 0) return;
    setActive((prev) => (prev + 1) % products.length);
  }, [products.length]);

  const prev = useCallback(() => {
    if (products.length === 0) return;
    setActive((p) => (p - 1 + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1) return;

    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, products.length]);

  function goTo(index: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setActive(index);
    if (products.length > 1) {
      timerRef.current = setInterval(next, 5000);
    }
  }

  function navigate(direction: "prev" | "next") {
    if (timerRef.current) clearInterval(timerRef.current);
    if (direction === "prev") prev(); else next();
    if (products.length > 1) {
      timerRef.current = setInterval(next, 5000);
    }
  }

  async function handleAddToCart(productId: string, productName: string) {
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
      toast.error(error instanceof Error ? error.message : "Failed to add to cart.");
    }
  }

  async function handleToggleWishlist(productId: string, productName: string) {
    const wishlisted = isWishlisted(productId);
    try {
      const res = await fetch(wishlisted ? "/api/wishlist/remove" : "/api/wishlist/add", {
        method: wishlisted ? "DELETE" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong.");
      }
      await refreshWishlist();
      toast.success(wishlisted ? `Removed ${productName} from wishlist.` : `Added ${productName} to wishlist.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  const product = products[active];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-5 pb-2 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="group relative min-h-[420px] overflow-hidden rounded-2xl bg-neutral-900">
          {loading || !product ? (
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-600 to-fuchsia-500">
              <div className="absolute right-[-3rem] top-[-3rem] h-48 w-48 rounded-full border border-white/20" />
              <div className="absolute bottom-[-4rem] left-[-3rem] h-56 w-56 rounded-full bg-white/10" />
              <div className="relative z-10 flex h-full items-center justify-center p-8 sm:p-10">
                <div className="text-center">
                  <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    New Season 2026
                  </span>
                  <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                    Upgrade Your
                    <br />
                    Lifestyle Today
                  </h1>
                  <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base">
                    Shop the latest trends in electronics, fashion, and home
                    essentials. Unbeatable prices, guaranteed quality.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      href="/products"
                      className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-primary transition hover:bg-white/90"
                    >
                      Shop Now
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/deals"
                      className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      View Deals
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Image
                src={product.image || FALLBACK_IMAGE}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

              <div className="relative z-10 flex min-h-[420px] flex-col justify-between p-8 sm:p-10">
                <div className="max-w-lg">
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    {product.category || "Trending"}
                  </span>
                  <h1 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl line-clamp-2 drop-shadow-lg">
                    {product.name}
                  </h1>
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-white">{product.rating}</span>
                    <span className="text-sm text-white/70">({product.reviews})</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-white drop-shadow-lg">
                      Rs. {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-white/60 line-through">
                        Rs. {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-w-lg">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-sm font-semibold text-primary transition hover:bg-white/90"
                    >
                      View Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleAddToCart(product.id, product.name)}
                      className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/20 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleWishlist(product.id, product.name)}
                      className="inline-flex h-12 items-center gap-2 rounded-xl bg-white/20 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/30"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isWishlisted(product.id) ? "fill-red-400 text-red-400" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-5 flex gap-2">
                    {products.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goTo(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === active
                            ? "w-6 bg-white"
                            : "w-2 bg-white/40 hover:bg-white/60"
                        }`}
                        aria-label={`Go to product ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {products.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("prev")}
                    className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 group-hover:opacity-100"
                    aria-label="Previous product"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("next")}
                    className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/60 group-hover:opacity-100"
                    aria-label="Next product"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/deals"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <span className="text-xl font-bold text-primary">%</span>
            </div>
            <div>
              <p className="text-sm font-bold">Up to 40% Off</p>
              <p className="text-xs text-muted-foreground">
                Featured deals today
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>

          <Link
            href="/products"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Free Shipping</p>
              <p className="text-xs text-muted-foreground">
                On orders over Rs. 5,000
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </section>
  );
}
