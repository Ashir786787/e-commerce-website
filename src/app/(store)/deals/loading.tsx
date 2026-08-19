export default function DealsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 rounded bg-neutral-200" />
        <div className="h-4 w-72 rounded bg-neutral-200" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border bg-card">
            <div className="aspect-square rounded-t-2xl bg-neutral-200" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-16 rounded bg-neutral-200" />
              <div className="h-4 w-3/4 rounded bg-neutral-200" />
              <div className="h-5 w-20 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
