import Link from "next/link";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import CategoryImage from "@/components/admin/CategoryImage";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await connectDB();

  const categories = await Category.find({
    isActive: true,
  })
    .sort({ name: 1 })
    .lean();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Browse
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Product Categories
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Explore NovaCart products by category and quickly find what you
              are looking for.
            </p>
          </div>
        </section>

        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {categories.length === 0 ? (
              <div className="rounded-2xl border p-12 text-center">
                <h2 className="text-xl font-semibold">
                  No categories available
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Categories will appear here once they are added.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Link
                    key={category._id.toString()}
                    href={`/categories/${category.slug}`}
                    className="group overflow-hidden rounded-2xl border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <CategoryImage
                        src={category.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10"}
                        alt={category.name}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center bg-indigo-50">
                            <span className="text-5xl font-bold text-indigo-600/30">
                              {category.name
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                        }
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-semibold transition group-hover:text-primary">
                        {category.name}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {category.description || "Explore products from this category."}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
