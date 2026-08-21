import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function DealsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-8 space-y-3">
        <div className="h-3 w-16 rounded bg-neutral-200/70" />
        <div className="h-8 w-48 rounded bg-neutral-200/70" />
        <div className="h-4 w-72 rounded bg-neutral-200/70" />
      </div>
      <ProductGridSkeleton count={8} />
    </div>
  );
}
