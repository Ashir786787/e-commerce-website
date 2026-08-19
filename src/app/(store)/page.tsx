import AnnouncementBar from "@/components/home/AnnouncementBar";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryBar from "@/components/home/CategoryBar";
import FlashDeals from "@/components/home/FlashDeals";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrendingProducts from "@/components/home/TrendingProducts";
import NewArrivals from "@/components/home/NewArrivals";
import { connectDB } from "@/lib/db";
import "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

async function getTrendingProducts() {
  try {
    await connectDB();
    const products = await Product.find({ isTrending: true, isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1, _id: -1 })
      .limit(6)
      .lean();

    return products.map((p) => ({
      id: p._id.toString(),
      slug: p.slug,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice,
      image: p.images[0]?.url || "",
      category:
        p.category && typeof p.category === "object" && "name" in p.category
          ? (p.category as { name: string }).name
          : "",
      rating: p.rating,
      reviews: p.reviewCount,
      discount:
        p.originalPrice && p.originalPrice > p.price
          ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
          : 0,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const trendingProducts = await getTrendingProducts();

  return (
    <>
      <AnnouncementBar />
      <CategoryBar />

      <main className="flex-1">
        <HeroBanner initialProducts={trendingProducts} />
        <FlashDeals />
        <TrendingProducts />
        <FeaturedCategories />
        <NewArrivals />
      </main>
    </>
  );
}
