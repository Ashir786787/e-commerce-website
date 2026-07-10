import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="border-b bg-gradient-to-b from-primary/5 to-background">
      <div className="mx-auto grid min-h-[72vh] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="mb-4 inline-flex rounded-full border bg-background px-4 py-2 text-sm font-medium text-primary">
            Smart shopping starts here
          </p>

          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Discover products you’ll love at prices you’ll appreciate.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Explore fashion, electronics, home essentials, lifestyle products,
            and more—all in one secure and convenient marketplace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground whitespace-nowrap transition-all hover:bg-primary/80"
            >
              Shop Now
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/categories"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
            >
              Explore Categories
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Fast Delivery</p>
                <p className="text-xs text-muted-foreground">
                  Quick and reliable
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Secure Payments</p>
                <p className="text-xs text-muted-foreground">
                  Protected checkout
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-muted-foreground">
                  Simple return process
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-3xl border bg-muted shadow-sm">
            <div className="flex h-full items-center justify-center p-10 text-center">
              <div>
                <p className="text-sm font-medium text-primary">
                  NovaCart Collection
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Your next favorite product is waiting.
                </h2>

                <p className="mt-4 text-muted-foreground">
                  Product imagery will be added here when we build the product
                  catalogue.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 rounded-2xl border bg-background px-5 py-4 shadow-lg">
            <p className="text-sm text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold text-primary">Rs. 999</p>
          </div>
        </div>
      </div>
    </section>
  );
}