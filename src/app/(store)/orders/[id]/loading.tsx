export default function OrderDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-6 h-4 w-32 rounded bg-neutral-200/70" />
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-neutral-200/70" />
            <div className="h-4 w-32 rounded bg-neutral-200/70" />
          </div>
          <div className="h-8 w-24 rounded-full bg-neutral-200/70" />
        </div>
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 rounded-xl border border-neutral-100 p-4">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-neutral-200/70" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-neutral-200/70" />
                <div className="h-3 w-1/2 rounded bg-neutral-200/70" />
              </div>
              <div className="h-5 w-20 rounded bg-neutral-200/70" />
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-3 border-t border-neutral-100 pt-6">
          <div className="h-4 w-full rounded bg-neutral-200/70" />
          <div className="h-4 w-full rounded bg-neutral-200/70" />
          <div className="h-4 w-2/3 rounded bg-neutral-200/70" />
          <div className="mt-4 h-6 w-40 rounded bg-neutral-200/70" />
        </div>
      </div>
    </div>
  );
}
