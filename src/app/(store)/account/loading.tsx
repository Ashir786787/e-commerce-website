export default function AccountLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-8 h-8 w-48 rounded bg-neutral-200" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-6">
            <div className="h-10 w-10 rounded-xl bg-neutral-200" />
            <div className="mt-4 h-5 w-32 rounded bg-neutral-200" />
            <div className="mt-2 h-3 w-48 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
      <div className="mt-10 space-y-4">
        <div className="h-6 w-36 rounded bg-neutral-200" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border p-6">
            <div className="flex justify-between">
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-neutral-200" />
                <div className="h-3 w-48 rounded bg-neutral-200" />
              </div>
              <div className="h-6 w-20 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
