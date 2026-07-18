"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

function formatCategoryLabel(value: string) {
  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeFilters: ActiveFilter[] = [];

  const search = searchParams.get("search");

  if (search) {
    activeFilters.push({
      key: "search",
      value: search,
      label: `Search: ${search}`,
    });
  }

  const categories = searchParams.getAll("category");

  categories.forEach((category) => {
    activeFilters.push({
      key: "category",
      value: category,
      label: formatCategoryLabel(category),
    });
  });

  const brands = searchParams.getAll("brand");

  brands.forEach((brand) => {
    activeFilters.push({
      key: "brand",
      value: brand,
      label: brand,
    });
  });

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  if (minPrice || maxPrice) {
    activeFilters.push({
      key: "price",
      value: `${minPrice ?? ""}-${maxPrice ?? ""}`,
      label: `Rs. ${minPrice ?? "0"} – ${maxPrice ?? "Any"}`,
    });
  }

  if (searchParams.get("featured") === "true") {
    activeFilters.push({
      key: "featured",
      value: "true",
      label: "Featured",
    });
  }

  if (searchParams.get("trending") === "true") {
    activeFilters.push({
      key: "trending",
      value: "true",
      label: "Trending",
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  function removeFilter(filter: ActiveFilter) {
    const params = new URLSearchParams(searchParams.toString());

    if (filter.key === "category" || filter.key === "brand") {
      const remainingValues = params
        .getAll(filter.key)
        .filter((value) => value !== filter.value);

      params.delete(filter.key);

      remainingValues.forEach((value) => {
        params.append(filter.key, value);
      });
    } else if (filter.key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.delete(filter.key);
    }

    params.delete("page");

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname
    );
  }

  function clearAllFilters() {
    router.push(pathname);
  }
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <button
          key={`${filter.key}-${filter.value}`}
          type="button"
          onClick={() => removeFilter(filter)}
          className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm font-medium transition hover:bg-muted/70"
        >
          <span>{filter.label}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      ))}

      <button
        type="button"
        onClick={clearAllFilters}
        className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Clear All
      </button>
    </div>
  );
}
