"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "newest";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", value);
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="sort"
        className="text-sm font-medium whitespace-nowrap"
      >
        Sort:
      </label>

      <select
        id="sort"
        value={currentSort}
        onChange={(e) => handleChange(e.target.value)}
        className="min-w-[220px] rounded-lg border bg-background px-3 py-2"
      >
        <option value="newest">Newest</option>
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low → High</option>
        <option value="price-desc">Price: High → Low</option>
        <option value="name-asc">Name: A → Z</option>
        <option value="name-desc">Name: Z → A</option>
      </select>
    </div>
  );
}