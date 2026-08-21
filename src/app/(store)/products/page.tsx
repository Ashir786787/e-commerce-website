import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import MobileProductFilters from "@/components/product/MobileProductFilters";
import ActiveFilters from "@/components/product/ActiveFilters";
import ProductPagination from "@/components/product/ProductPagination";
import ProductSort from "@/components/product/ProductSort";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getCategoryName } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
  const sort = typeof params.sort === "string" ? params.sort : "newest";
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
    const term = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const termLower = search.trim().toLowerCase();
    const categoryIds = categories
      .filter((c) => c.name.toLowerCase().includes(termLower))
      .map((c) => c._id);

    const conditions: Record<string, unknown>[] = [
      { name: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { brand: { $regex: term, $options: "i" } },
      { slug: { $regex: term, $options: "i" } },
    ];

    if (categoryIds.length > 0) {
      conditions.push({ category: { $in: categoryIds } });
    }

    query.$or = conditions;
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

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    "name-asc": { name: 1 },
    "name-desc": { name: -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };

  const sortQuery = sortMap[sort] || sortMap.newest;

  const products = await Product.find(query)
    .populate("category", "name slug image")
    .sort(sortQuery)
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
    <main>
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Shop</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:mt-3 sm:text-4xl lg:text-5xl">
              {search ? `Search results for "${search}"` : "All Products"}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {search
                ? `${totalProducts} product${totalProducts === 1 ? "" : "s"} found.`
                : "Browse the complete NovaCart collection and discover products across all categories."}
            </p>
          </div>
        </section>

        <section className="py-8 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 border-b pb-4 sm:mb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Showing {totalProducts} Product{totalProducts !== 1 ? "s" : ""}
                </h2>
                {search && (
                  <p className="text-sm text-muted-foreground">
                    Results for &quot;<span className="font-medium">{search}</span>&quot;
                  </p>
                )}
              </div>
              <ProductSort />
            </div>

            <MobileProductFilters categories={filterCategories} brands={sortedBrands} />

            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="hidden lg:block">
                <ProductFilters categories={filterCategories} brands={sortedBrands} />
              </div>

              <div className="min-w-0">
                <ActiveFilters />

                {products.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
                    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-indigo-50">
                      <svg className="h-9 w-9 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                    <h2 className="mt-6 text-2xl font-bold text-neutral-900">No products found</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm text-neutral-500">
                      We could not find any products matching your filters. Try adjusting your search criteria.
                    </p>
                    <Link
                      href="/products"
                      className="mt-7 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
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
                              image: product.images[0]?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10",
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
  );
}
