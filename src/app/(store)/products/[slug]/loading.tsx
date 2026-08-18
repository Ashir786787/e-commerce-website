export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-pulse">
      <div className="mb-8 flex gap-2">
        <div className="h-4 w-12 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-20 rounded bg-neutral-200" />
        <div className="h-4 w-4 rounded bg-neutral-200" />
        <div className="h-4 w-32 rounded bg-neutral-200" />
      </div>

      <section className="grid gap-12 lg:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-neutral-200" />

        <div className="flex flex-col justify-center space-y-6">
          <div className="h-4 w-24 rounded bg-neutral-200" />
          <div className="h-12 w-3/4 rounded bg-neutral-200" />
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-6 w-40 rounded bg-neutral-200" />
          <div className="h-10 w-48 rounded bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-full rounded bg-neutral-200" />
            <div className="h-4 w-2/3 rounded bg-neutral-200" />
          </div>
          <div className="h-14 w-full rounded-2xl bg-neutral-200" />
          <div className="h-16 w-full rounded-2xl bg-neutral-200" />
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="h-14 rounded bg-neutral-200" />
            <div className="h-14 rounded bg-neutral-200" />
            <div className="h-14 rounded bg-neutral-200" />
          </div>
        </div>
      </section>
    </div>
  );
}
