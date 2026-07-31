"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function AdminPagination({
  currentPage,
  totalPages,
}: AdminPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    router.push(
      params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname
    );
  }

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <nav
      aria-label="Admin pagination"
      className="mt-6 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => goToPage(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition",
            page === currentPage
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-indigo-300 hover:text-indigo-600"
          )}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
