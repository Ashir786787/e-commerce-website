"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import ProductFilters from "@/components/product/ProductFilters";
import { Button } from "@/components/ui/button";

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="mr-2 h-4 w-4" />
        ) : (
          <SlidersHorizontal className="mr-2 h-4 w-4" />
        )}

        {isOpen ? "Close Filters" : "Show Filters"}
      </Button>

      {isOpen && (
        <ProductFilters
          categories={categories}
          brands={brands}
          className="mt-4"
        />
      )}
    </div>
  );
}