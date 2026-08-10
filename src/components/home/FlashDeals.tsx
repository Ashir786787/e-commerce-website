import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { connectDB } from "@/lib/db";
import "@/models/Category";
import Product from "@/models/Product";
import ProductCard from "@/components/product/ProductCard";
import { getCategoryName } from "@/lib/utils";
import CountdownTimer from "./CountdownTimer";

export default async function FlashDeals() {
  await connectDB();

  const products = await Product.find({
    isActive: true,
    originalPrice: { $gt: 0 },
  })
    .populate("category", "name slug image")
    .sort({ createdAt: -1, _id: -1 })
    .limit(10)
    .lean();

  const deals = products.filter(
    (p) => p.originalPrice && p.originalPrice > p.price
  );

  if (deals.length === 0) return null;

  return (
    <section className="py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 fill-primary text-primary" />
              <h2 className="text-xl font-bold sm:text-2xl">Deals of the Day</h2>
            </div>
            <CountdownTimer />
          </div>
          <Link
            href="/deals"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 sm:gap-4">
          {deals.map((product) => (
            <div key={product._id.toString()} className="w-[180px] shrink-0 sm:w-[200px]">
              <ProductCard
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
        </div>
      </div>
    </section>
  );
}
