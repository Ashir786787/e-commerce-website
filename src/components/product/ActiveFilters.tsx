"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = [
    {
      key: "category",
      label: searchParams.get("category"),
    },
    {
      key: "brand",
      label: searchParams.get("brand"),
    },
    {
      key: "featured",
      label:
        searchParams.get("featured") === "true"
          ? "Featured"
          : null,
    },
    {
      key: "trending",
      label:
        searchParams.get("trending") === "true"
          ? "Trending"
          : null,
    },
  ];

  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  if (minPrice || maxPrice) {
    filters.push({
      key: "price",
      label: `Rs. ${minPrice ?? "0"} - ${maxPrice ?? "∞"}`,
    });
  }

  const activeFilters = filters.filter(
    (filter) => filter.label
  );

  if (activeFilters.length === 0) {
    return null;
  }

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.delete(key);
    }

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
    <div className="mb-6 flex flex-wrap gap-2">
      {activeFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => removeFilter(filter.key)}
          className="rounded-full border bg-muted px-4 py-2 text-sm transition hover:bg-muted/70"
        >
          {filter.label} ✕
        </button>
      ))}

      <button
        onClick={clearAllFilters}
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Clear All
      </button>
    </div>
  );
}