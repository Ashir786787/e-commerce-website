import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <main>
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-10 w-64" />
          <Skeleton className="mt-4 h-4 w-96 max-w-full" />
        </div>
      </section>
      <section className="py-8 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-center justify-between border-b pb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-40 rounded-xl" />
          </div>
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <Skeleton className="h-6 w-24 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
                  <Skeleton className="aspect-[4/3] rounded-none rounded-t-2xl" />
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-20" />
                    <div className="flex items-center justify-between pt-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
