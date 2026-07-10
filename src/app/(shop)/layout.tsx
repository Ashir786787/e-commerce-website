import Link from "next/link";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            NovaCart
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/products" className="text-sm hover:text-primary">
              Products
            </Link>
            <Link href="/cart" className="text-sm hover:text-primary">
              Cart
            </Link>
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
