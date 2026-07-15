import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import ProductCard from "@/components/product/ProductCard";

import { connectDB } from "@/lib/db";
import "@/models/Category";
import Product from "@/models/Product";
import { getCategoryName } from "@/lib/utils";

export default async function ProductsPage() {
  await connectDB();

  const products = await Product.find({
    isActive: true,
  })
    .populate("category", "name slug image")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Shop
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              All Products
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Browse the complete NovaCart collection and discover products
              across electronics, fashion, accessories, and more.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {products.length === 0 ? (
              <div className="rounded-2xl border bg-background p-12 text-center">
                <h2 className="text-xl font-semibold">
                  No products available
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Products will appear here once they are added.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => {
                  const category = getCategoryName(product.category);

                  const discount =
                    product.originalPrice &&
                    product.originalPrice > product.price
                      ? Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )
                      : undefined;

                  return (
                    <ProductCard
                      key={product._id.toString()}
                      product={{
                        id: product._id.toString(),
                        slug: product.slug,
                        name: product.name,
                        category,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        rating: product.rating,
                        reviews: product.reviewCount,
                        image:
                          product.images[0]?.url ||
                          "/products/electronics/headphones.jpg",
                        discount,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}