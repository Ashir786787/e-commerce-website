import { ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-10 w-48" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <ProductGridSkeleton count={4} />
      </div>
    </main>
  );
}
