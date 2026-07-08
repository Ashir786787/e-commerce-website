export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">All Products</h1>
      <p className="text-muted-foreground mt-1">Browse our collection</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <p className="col-span-full text-center text-muted-foreground">
          Products coming soon
        </p>
      </div>
    </div>
  );
}
