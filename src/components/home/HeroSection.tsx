import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

const trustFeatures = [
  {
    title: "Free Delivery",
    description: "On qualifying orders",
    icon: Truck,
  },
  {
    title: "Secure Checkout",
    description: "Protected payments",
    icon: ShieldCheck,
  },
  {
    title: "Easy Returns",
    description: "Simple return process",
    icon: PackageCheck,
  },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-8rem] h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(79,70,229,0.03)_50%,transparent_100%)]" />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
            <BadgeCheck className="h-4 w-4 text-primary" />
            New season collection is now available
          </div>
          <h1 className="mt-7 text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-7xl">
            Shop smarter.
            <span className="block bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Live better.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Explore carefully selected fashion, electronics, home essentials,
            accessories, and lifestyle products—all in one modern marketplace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground whitespace-nowrap transition-all hover:bg-primary/80"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/categories"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-7 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
            >
              Explore Categories
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm text-muted-foreground">Happy customers</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold">5K+</p>
              <p className="text-sm text-muted-foreground">Quality products</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold">4.9</p>
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-sm text-muted-foreground">Customer rating</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute inset-6 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-primary via-violet-600 to-fuchsia-500 p-8 shadow-2xl sm:p-10">
            <div className="absolute right-[-4rem] top-[-4rem] h-48 w-48 rounded-full border border-white/20" />
            <div className="absolute bottom-[-5rem] left-[-4rem] h-56 w-56 rounded-full bg-white/10" />
            <div className="relative z-10 flex min-h-[420px] flex-col justify-between text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/75">
                    NovaCart Exclusive
                  </p>
                  <h2 className="mt-2 max-w-sm text-3xl font-bold leading-tight sm:text-4xl">
                    Premium products for your everyday lifestyle.
                  </h2>
                  <div className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                    Today&apos;s offer: Up to 40% off
                  </div>
                  <div className="mt-3 flex w-fit items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 backdrop-blur">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-white" />
                    <div>
                      <p className="text-sm font-semibold text-white">Buyer protection</p>
                      <p className="text-xs text-white/70">Safe and secure orders</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                  <ShoppingBag className="h-7 w-7" />
                </div>
              </div>

              <div className="my-10 flex flex-1 items-center justify-center">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-inner backdrop-blur sm:h-64 sm:w-64">
                  <div className="absolute inset-5 rounded-full border border-white/20" />
                  <ShoppingBag className="h-24 w-24 stroke-[1.2] text-white sm:h-32 sm:w-32" />
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-white/75">Collections starting at</p>
                  <p className="mt-1 text-3xl font-bold">Rs. 999</p>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
                >
                  Shop collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          {trustFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex items-center justify-center gap-3 md:justify-start"
              >
                <div className="rounded-xl bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}