import Link from "next/link";
import { ArrowRight, Percent } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

interface DealProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  discount: number;
}

interface DealsContentProps {
  deals: DealProduct[];
}

export default function DealsContent({
  deals,
}: DealsContentProps) {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-violet-100/40 blur-3xl" />
        <div className="relative mx-auto flex min-h-[50vh] max-w-7xl flex-col items-center justify-center px-6 py-24 text-center lg:px-8">
          <span className="rounded-full border border-indigo-200 bg-indigo-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">
            Limited Time Offers
          </span>
          <h1 className="mt-8 max-w-4xl text-5xl font-bold tracking-tight text-gray-900 lg:text-7xl">
            Today&apos;s Hottest
            <span className="block text-indigo-600">Deals</span>
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-gray-600">
            Grab exclusive discounts on premium products before they are gone.
            These deals are available for a limited time only.
          </p>
        </div>
      </section>

      <section
        id="featured-deals"
        className="bg-neutral-50 py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                Featured offers
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-neutral-950">
                Today&apos;s Best Deals
              </h2>

              <p className="mt-4 max-w-2xl leading-7 text-neutral-600">
                Explore selected NovaCart products available at reduced prices for a
                limited time.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 font-semibold text-indigo-600 transition hover:gap-3"
            >
              View all products
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {deals.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
              <Percent className="mx-auto h-12 w-12 text-indigo-500" />

              <h3 className="mt-5 text-2xl font-semibold text-neutral-950">
                New deals are coming soon
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-neutral-600">
                There are currently no discounted products. Explore the full
                NovaCart collection while new offers are being prepared.
              </p>

              <Link
                href="/products"
                className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 font-semibold text-white transition hover:bg-indigo-700"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {deals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
