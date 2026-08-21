"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductFilters from "@/components/product/ProductFilters";

interface FilterCategory {
  id: string;
  name: string;
  slug: string;
}

interface MobileProductFiltersProps {
  categories: FilterCategory[];
  brands: string[];
}

export default function MobileProductFilters({
  categories,
  brands,
}: MobileProductFiltersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold transition hover:border-primary/40"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {open && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-base font-bold">Filters</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              <ProductFilters
                categories={categories}
                brands={brands}
                className="border-0 p-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
