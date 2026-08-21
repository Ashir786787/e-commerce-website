export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4">
      <div className="relative">
        <div className="size-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-neutral-900">
          Loading NovaCart
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
}
