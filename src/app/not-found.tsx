import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <SearchX className="h-7 w-7" />
      </div>

      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          404
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
          Page Not Found
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
