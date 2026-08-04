import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import DealsContent from "@/components/deals/DealsContent";
import { connectDB } from "@/lib/db";
import "@/models/Category";
import Product from "@/models/Product";
import { getCategoryName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  await connectDB();

  const products = await Product.find({
    isActive: true,
    originalPrice: { $gt: 0 },
    $expr: { $gt: ["$originalPrice", "$price"] },
  })
    .populate("category", "name slug image")
    .sort({ createdAt: -1 })
    .lean();

  const deals = products.map((product) => ({
    id: product._id.toString(),
    slug: product.slug,
    name: product.name,
    category: getCategoryName(product.category),
    price: product.price,
    originalPrice: product.originalPrice ?? product.price,
    rating: product.rating,
    reviews: product.reviewCount,
    image: product.images[0]?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10",
    discount:
      product.originalPrice && product.originalPrice > product.price
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
          )
        : 0,
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <div className="flex-1">
        <DealsContent deals={deals} />
      </div>

      <SiteFooter />
    </div>
  );
}