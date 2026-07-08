import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh">
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
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
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <section className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight">
            Welcome to NovaCart
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Discover premium products curated just for you. Shop the best in
            fashion, electronics, home goods, and more.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/products"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Shop Now
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NovaCart. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
