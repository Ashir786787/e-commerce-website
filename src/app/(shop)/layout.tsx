export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            NovaCart
          </a>
          <nav className="flex items-center gap-6">
            <a href="/products" className="text-sm hover:text-primary">
              Products
            </a>
            <a href="/cart" className="text-sm hover:text-primary">
              Cart
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NovaCart. All rights reserved.
        </div>
      </footer>
    </>
  );
}
