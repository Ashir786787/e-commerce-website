"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ProductSearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = useState(
    searchParams.get("search") ?? ""
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }

    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  }
  return (
    <form
      onSubmit={submit}
      className="mb-8 flex gap-3"
    >
      <div className="relative flex-1">
        <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search products..."
          className="w-full rounded-xl border py-3 pl-11 pr-4"
        />
      </div>

      <button
        className="rounded-xl bg-primary px-6 text-white"
      >
        Search
      </button>
    </form>
  );
}
