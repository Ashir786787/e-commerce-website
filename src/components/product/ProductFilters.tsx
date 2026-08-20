"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
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

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/60 py-5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          {title}
        </h3>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function ProductFilters({
  categories,
  brands,
  className,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const minPriceRef = useRef<HTMLInputElement>(null);
  const maxPriceRef = useRef<HTMLInputElement>(null);

  const selectedCategories = searchParams.getAll("category");
  const selectedBrands = searchParams.getAll("brand");
  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (searchParams.get("minPrice") ? 1 : 0) +
    (searchParams.get("maxPrice") ? 1 : 0) +
    (searchParams.get("featured") === "true" ? 1 : 0) +
    (searchParams.get("trending") === "true" ? 1 : 0);

  function toggleCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("category");
    params.delete("category");
    const updated = current.includes(slug)
      ? current.filter((c) => c !== slug)
      : [...current, slug];
    updated.forEach((c) => params.append("category", c));
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function toggleBrand(brand: string) {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll("brand");
    params.delete("brand");
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    updated.forEach((b) => params.append("brand", b));
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function applyPriceFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    const min = minPriceRef.current?.value?.trim() ?? "";
    const max = maxPriceRef.current?.value?.trim() ?? "";
    if (min) params.set("minPrice", min);
    else params.delete("minPrice");
    if (max) params.set("maxPrice", max);
    else params.delete("maxPrice");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function handleBooleanFilter(key: "featured" | "trending", checked: boolean) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (checked) params.set(key, "true");
    else params.delete(key);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <aside
      className={cn(
        "h-fit rounded-2xl border bg-card p-5 lg:sticky lg:top-24",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </div>

      <CollapsibleSection title="Categories">
        {categories.length === 0 ? (
          <p className="text-xs text-muted-foreground">None available</p>
        ) : (
          <div className="space-y-2.5">
            {categories.map((category) => {
              const checked = selectedCategories.includes(category.slug);
              return (
                <label
                  key={category.id}
                  onClick={() => toggleCategory(category.slug)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition",
                      checked
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {checked && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{category.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Brands">
        {brands.length === 0 ? (
          <p className="text-xs text-muted-foreground">None available</p>
        ) : (
          <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
            {brands.map((brand) => {
              const checked = selectedBrands.includes(brand);
              return (
                <label
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-muted/50"
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition",
                      checked
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {checked && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm">{brand}</span>
                </label>
              );
            })}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Price Range">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              ref={minPriceRef}
              type="number"
              placeholder="Min"
              defaultValue={searchParams.get("minPrice") ?? ""}
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              ref={maxPriceRef}
              type="number"
              placeholder="Max"
              defaultValue={searchParams.get("maxPrice") ?? ""}
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button
            type="button"
            onClick={applyPriceFilter}
            className="w-full rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            Apply Price
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Type">
        <div className="space-y-2.5">
          {([
            { key: "featured" as const, label: "Featured" },
            { key: "trending" as const, label: "Trending" },
          ]).map(({ key, label }) => {
            const checked = searchParams.get(key) === "true";
            return (
              <label
                key={key}
                onClick={() => handleBooleanFilter(key, !checked)}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-muted/50"
              >
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition",
                    checked
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {checked && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{label}</span>
              </label>
            );
          })}
        </div>
      </CollapsibleSection>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          <X className="h-4 w-4" />
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
