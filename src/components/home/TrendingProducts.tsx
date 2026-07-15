import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { connectDB } from "@/lib/db";
import "@/models/Category";
import Product from "@/models/Product";
import ProductCard from "@/components/product/ProductCard";
import { getCategoryName } from "@/lib/utils";

export default async function TrendingProducts() {
  await connectDB();

  const products = await Product.find({
    isTrending: true,
    isActive: true,
  })
    .populate("category", "name slug image")
    .sort({ createdAt: -1, _id: -1 })
    .limit(4)
    .lean();

  return (
    <section className="bg-muted/20 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between gap-4">
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

        {products.length === 0 ? (
          <div className="rounded-2xl border bg-background p-10 text-center">
            <p className="text-lg font-semibold">
              No trending products available.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please check again later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product._id.toString()}
                product={{
                  id: product._id.toString(),
                  slug: product.slug,
                  name: product.name,
                  category: getCategoryName(product.category),
                  price: product.price,
                  originalPrice: product.originalPrice,
                  rating: product.rating,
                  reviews: product.reviewCount,
                  image:
                    product.images[0]?.url ||
                    "/products/electronics/headphones.jpg",
                  discount:
                    product.originalPrice &&
                    product.originalPrice > product.price
                      ? Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )
                      : undefined,
                }}
              />
            ))}
            </div>
          )}
        </div>
      </section>
    );
  }