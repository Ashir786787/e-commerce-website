import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Link href="/" className="text-2xl font-bold text-primary">
            NovaCart
          </Link>

          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Discover quality products, secure shopping, and a simple checkout
            experience—all in one place.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Shop</h3>

          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            <Link href="/categories" className="hover:text-foreground">
              Categories
            </Link>
            <Link href="/deals" className="hover:text-foreground">
              Deals
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Account</h3>

          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Login
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Create Account
            </Link>
            <Link href="/orders" className="hover:text-foreground">
              Orders
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t py-5 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} NovaCart. All rights reserved.
      </div>
    </footer>
  );
}