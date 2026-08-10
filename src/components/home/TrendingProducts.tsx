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
    .limit(10)
    .lean();

  if (products.length === 0) return null;

  return (
    <section className="py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">Trending Products</h2>
          <Link
            href="/products"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-4">
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
                image: product.images[0]?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10",
                discount:
                  product.originalPrice && product.originalPrice > product.price
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
      </div>
    </section>
  );
}
