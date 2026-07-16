"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterCategory {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: FilterCategory[];
  brands: string[];
  className?: string;
}

export default function ProductFilters({
  categories,
  brands,
  className,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function handleCategoryChange(categorySlug: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.set("category", categorySlug);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleBrandChange(brand: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (params.get("brand") === brand) {
      params.delete("brand");
    } else {
      params.set("brand", brand);
    }

    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function applyPriceFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (minPrice.trim()) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice.trim()) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function handleBooleanFilter(key: "featured" | "trending", checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (checked) {
      params.set(key, "true");
    } else {
      params.delete(key);
    }

    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  }

  return (
    <aside className={cn("h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-24", className)}>
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Categories
        </h3>

        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories available.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  type="radio"
                  name="category"
                  value={category.slug}
                  checked={searchParams.get("category") === category.slug}
                  onChange={() => handleCategoryChange(category.slug)}
                  className="h-4 w-4 accent-primary"
                />

                <span className="text-sm">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Brands
        </h3>

        {brands.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No brands available.
          </p>
        ) : (
          <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex cursor-pointer items-center gap-3"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={searchParams.get("brand") === brand}
                  onChange={() => handleBrandChange(brand)}
                  className="h-4 w-4 accent-primary"
                />

                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Price Range
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">
              Minimum Price
            </label>

            <Input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={applyPriceFilter}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">
              Maximum Price
            </label>

            <Input
              type="number"
              placeholder="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={applyPriceFilter}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Product Type
        </h3>

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={searchParams.get("featured") === "true"}
              onChange={(event) =>
                handleBooleanFilter("featured", event.target.checked)
              }
              className="h-4 w-4 rounded accent-primary"
            />

            <span className="text-sm">Featured Products</span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={searchParams.get("trending") === "true"}
              onChange={(event) =>
                handleBooleanFilter("trending", event.target.checked)
              }
              className="h-4 w-4 rounded accent-primary"
            />

            <span className="text-sm">Trending Products</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={clearFilters}
        className="mt-6 w-full rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
      >
        Clear Filters
      </button>
    </aside>
  );
}
