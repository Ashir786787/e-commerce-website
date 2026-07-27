import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categories } from "@/data/categories";

export default function FeaturedCategories() {
  return (
    <section className="py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">Shop by Category</h2>
          <Link
            href="/categories"
            className="hidden items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex w-[130px] shrink-0 flex-col items-center gap-2 rounded-xl border bg-card p-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm sm:w-[150px] sm:p-4"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full sm:h-20 sm:w-20">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="80px"
                  className="object-cover transition duration-300 group-hover:scale-110"
                />
              </div>
              <p className="text-center text-xs font-semibold sm:text-sm">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
