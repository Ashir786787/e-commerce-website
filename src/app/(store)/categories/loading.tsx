export default function CategoriesLoading() {
  return (
    <div className="animate-pulse">
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-3 w-16 rounded bg-neutral-200" />
          <div className="mt-3 h-10 w-64 rounded bg-neutral-200" />
          <div className="mt-4 h-4 w-96 max-w-full rounded bg-neutral-200" />
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border bg-card">
                <div className="aspect-[16/10] bg-neutral-200" />
                <div className="space-y-2 p-5">
                  <div className="h-5 w-32 rounded bg-neutral-200" />
                  <div className="h-3 w-full rounded bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
