import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryBar from "@/components/home/CategoryBar";
import FlashDeals from "@/components/home/FlashDeals";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import TrendingProducts from "@/components/home/TrendingProducts";
import NewArrivals from "@/components/home/NewArrivals";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <SiteHeader />
      <CategoryBar />

      <main className="flex-1">
        <HeroBanner />
        <FlashDeals />
        <TrendingProducts />
        <FeaturedCategories />
        <NewArrivals />
      </main>

      <SiteFooter />
    </div>
  );
}
