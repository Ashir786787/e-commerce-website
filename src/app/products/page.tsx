import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import MobileProductFilters from "@/components/product/MobileProductFilters";
import ActiveFilters from "@/components/product/ActiveFilters";
import ProductPagination from "@/components/product/ProductPagination";
import ProductSearch from "@/components/product/ProductSearch";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getCategoryName } from "@/lib/utils";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((v) => v.trim()).filter(Boolean);
}

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const selectedCategories = toArray(params.category);
  const selectedBrands = toArray(params.brand);
  const search = typeof params.search === "string" ? params.search : undefined;
  const minPrice = typeof params.minPrice === "string" ? params.minPrice : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? params.maxPrice : undefined;
  const featured = typeof params.featured === "string" ? params.featured : undefined;
  const trending = typeof params.trending === "string" ? params.trending : undefined;
  const pageParam = typeof params.page === "string" ? params.page : undefined;

  const page = Math.max(1, Number(pageParam) || 1);
  const limit = 8;

  await connectDB();

  const categories = await Category.find({ isActive: true })
    .select("name slug")
    .sort({ name: 1 })
    .lean();

  const brands = await Product.distinct("brand", { isActive: true });

  const query: Record<string, unknown> = { isActive: true };

  if (search?.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { brand: { $regex: term, $options: "i" } },
    ];
  }

  if (selectedCategories.length > 0) {
    const categoryDocs = await Category.find({
      slug: { $in: selectedCategories },
      isActive: true,
    }).select("_id").lean();
    if (categoryDocs.length > 0) {
      query.category = { $in: categoryDocs.map((c) => c._id) };
    }
  }

  if (selectedBrands.length > 0) {
    query.brand = { $in: selectedBrands };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) (query.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (query.price as Record<string, number>).$lte = Number(maxPrice);
  }

  if (featured === "true") query.isFeatured = true;
  if (trending === "true") query.isTrending = true;

  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * limit;

  const products = await Product.find(query)
    .populate("category", "name slug image")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const filterCategories = categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
  }));

  const sortedBrands = [...brands].sort();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Shop</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              {search ? `Search results for "${search}"` : "All Products"}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {search
                ? `${totalProducts} product${totalProducts === 1 ? "" : "s"} found.`
                : "Browse the complete NovaCart collection and discover products across all categories."}
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ProductSearch />

            <MobileProductFilters categories={filterCategories} brands={sortedBrands} />

            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="hidden lg:block">
                <ProductFilters
                  categories={filterCategories}
                  brands={sortedBrands}
                />
              </div>

              <div className="min-w-0">
                <ActiveFilters />

                {products.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-12 text-center">
                    <h2 className="text-2xl font-semibold">No products matched your filters</h2>
                    <p className="mt-3 text-muted-foreground">
                      Try changing or clearing some filters to discover more products.
                    </p>
                    <Link
                      href="/products"
                      className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                    >
                      Clear All Filters
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {products.map((product) => {
                        const cat = getCategoryName(product.category);
                        const discount =
                          product.originalPrice && product.originalPrice > product.price
                            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                            : undefined;

                        return (
                          <ProductCard
                            key={product._id.toString()}
                            product={{
                              id: product._id.toString(),
                              slug: product.slug,
                              name: product.name,
                              category: cat,
                              price: product.price,
                              originalPrice: product.originalPrice,
                              rating: product.rating,
                              reviews: product.reviewCount,
                              image: product.images[0]?.url || "/products/electronics/headphones.jpg",
                              discount,
                            }}
                          />
                        );
                      })}
                    </div>
                    <ProductPagination currentPage={currentPage} totalPages={totalPages} />
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
