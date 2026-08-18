import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getCategoryName } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { slug } = await params;

  await connectDB();

  const category = await Category.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!category) {
    notFound();
  }

  const products = await Product.find({
    category: category._id,
    isActive: true,
  })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main>
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <Link
              href="/categories"
              className="text-sm font-medium text-primary hover:underline"
            >
              ← All Categories
            </Link>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {category.name}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {category.description || `Browse all products in the ${category.name} category.`}
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {products.length === 0 ? (
              <div className="rounded-2xl border bg-background p-12 text-center">
                <h2 className="text-xl font-semibold">
                  No products found
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Products from this category will appear here once they are
                  added.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => {
                  const categoryName = getCategoryName(product.category, category.name);

                  const discount =
                    product.originalPrice && product.originalPrice > product.price
                      ? Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100
                        )
                      : undefined;

                  return (
                    <ProductCard
                      key={product._id.toString()}
                      product={{
                        id: product._id.toString(),
                        slug: product.slug,
                        name: product.name,
                        category: categoryName,
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
            )}
          </div>
        </section>
    </main>
  );
}
