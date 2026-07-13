import Link from "next/link";
import { ArrowRight } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import { trendingProducts } from "@/data/products";

export default function TrendingProducts() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Popular Right Now
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              Trending Products
            </h2>

            <p className="mt-4 max-w-2xl text-muted-foreground">
              Discover the products customers are loving this week.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden items-center gap-2 text-sm font-semibold text-primary hover:underline md:flex"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 