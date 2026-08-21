import { ProductGridSkeleton } from "@/components/ui/skeleton";

export default function CategoryDetailLoading() {
  return (
    <div className="animate-pulse">
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-3 w-16 rounded bg-neutral-200/70" />
          <div className="mt-3 h-10 w-48 rounded bg-neutral-200/70" />
          <div className="mt-4 h-4 w-72 max-w-full rounded bg-neutral-200/70" />
        </div>
      </section>
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProductGridSkeleton count={8} />
        </div>
      </section>
    </div>
  );
}
