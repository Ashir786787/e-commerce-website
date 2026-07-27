import Link from "next/link";
import { ArrowRight, Percent, Truck } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-5 pb-2 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-500 p-8 sm:p-10 lg:min-h-[400px]">
          <div className="absolute right-[-3rem] top-[-3rem] h-48 w-48 rounded-full border border-white/20" />
          <div className="absolute bottom-[-4rem] left-[-3rem] h-56 w-56 rounded-full bg-white/10" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                New Season 2026
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                Upgrade Your
                <br />
                Lifestyle Today
              </h1>
              <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base">
                Shop the latest trends in electronics, fashion, and home
                essentials. Unbeatable prices, guaranteed quality.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-primary transition hover:bg-white/90"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/deals"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/30 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Deals
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link
            href="/deals"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Percent className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Up to 40% Off</p>
              <p className="text-xs text-muted-foreground">
                Featured deals today
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>

          <Link
            href="/products"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold">Free Shipping</p>
              <p className="text-xs text-muted-foreground">
                On orders over Rs. 5,000
              </p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        </div>
      </div>
    </section>
  );
}
