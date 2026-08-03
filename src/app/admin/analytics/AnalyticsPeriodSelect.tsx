"use client";

import { useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";

interface AnalyticsPeriodSelectProps {
  period: string;
  basePath?: string;
}

const options = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

export default function AnalyticsPeriodSelect({
  period,
  basePath = "/admin/analytics",
}: AnalyticsPeriodSelectProps) {
  const router = useRouter();

  function handleChange(value: string) {
    router.push(
      value === "all" ? basePath : `${basePath}?period=${value}`
    );
  }

  return (
    <div className="relative">
      <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

      <select
        aria-label="Analytics period"
        value={period}
        onChange={(event) =>
          handleChange(event.target.value)
        }
        className="h-11 w-full appearance-none rounded-xl border border-neutral-300 bg-white pl-9 pr-8 text-sm font-medium text-neutral-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:w-auto"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <svg
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
