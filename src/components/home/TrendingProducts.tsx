import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { connectDB } from "@/lib/db";
import "@/models/Category";
import Product from "@/models/Product";
import ProductCard from "@/components/product/ProductCard";
import { getCategoryName } from "@/lib/utils";
import ProductCarousel from "./ProductCarousel";

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

        <ProductCarousel itemWidth={200} gap={16}>
          {products.map((product, index) => (
            <div key={product._id.toString()} className="w-[180px] shrink-0 sm:w-[200px]">
              <ProductCard
                priority={index < 2}
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
            </div>
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
