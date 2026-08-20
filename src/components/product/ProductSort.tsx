"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

export default function ProductSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get("sort") ?? "newest";
  const [open, setOpen] = useState(false);

  const currentLabel =
    sortOptions.find((o) => o.value === currentSort)?.label ?? "Sort";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-w-[200px] items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:border-primary/40"
      >
        <ArrowUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 text-left">{currentLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-full min-w-[200px] overflow-hidden rounded-xl border bg-background p-1.5 shadow-2xl">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              className={cn(
                "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted",
                option.value === currentSort &&
                  "bg-muted font-medium text-primary"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
