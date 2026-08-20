"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface ActiveFilter {
  key: string;
  value: string;
  label: string;
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ActiveFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ActiveFilter[] = [];

  const search = searchParams.get("search");
  if (search) {
    filters.push({ key: "search", value: search, label: `"${search}"` });
  }

  searchParams.getAll("category").forEach((c) => {
    filters.push({ key: "category", value: c, label: formatLabel(c) });
  });

  searchParams.getAll("brand").forEach((b) => {
    filters.push({ key: "brand", value: b, label: b });
  });

  const minP = searchParams.get("minPrice");
  const maxP = searchParams.get("maxPrice");
  if (minP || maxP) {
    filters.push({
      key: "price",
      value: `${minP ?? ""}-${maxP ?? ""}`,
      label: `Rs. ${minP ?? "0"} – ${maxP ?? "Any"}`,
    });
  }

  if (searchParams.get("featured") === "true") {
    filters.push({ key: "featured", value: "true", label: "Featured" });
  }
  if (searchParams.get("trending") === "true") {
    filters.push({ key: "trending", value: "true", label: "Trending" });
  }

  if (filters.length === 0) return null;

  function remove(filter: ActiveFilter) {
    const params = new URLSearchParams(searchParams.toString());

    if (filter.key === "category" || filter.key === "brand") {
      const remaining = params
        .getAll(filter.key)
        .filter((v) => v !== filter.value);
      params.delete(filter.key);
      remaining.forEach((v) => params.append(filter.key, v));
    } else if (filter.key === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.delete(filter.key);
    }

    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function clearAll() {
    router.push(pathname);
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <button
          key={`${f.key}-${f.value}`}
          type="button"
          onClick={() => remove(f)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
        >
          {f.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Clear All
      </button>
    </div>
  );
}
