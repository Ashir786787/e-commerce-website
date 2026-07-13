"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="border-b">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-2xl font-bold tracking-tight text-primary"
          >
            NovaCart
          </Link>

          <form
            action="/products"
            className="relative hidden flex-1 md:block"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

            <Input
              name="search"
              type="search"
              placeholder="Search products, categories, and brands..."
              className="h-11 rounded-full pl-12 pr-4"
            />
          </form>

          <div className="ml-auto hidden items-center gap-1 md:flex">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <span className="relative">
                <Heart className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  0
                </span>
              </span>
            </Link>

            <Link
              href="/cart"
              aria-label="Cart"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  0
                </span>
              </span>
            </Link>

            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "ml-2 rounded-full"
              )}
            >
              <UserRound className="mr-2 h-4 w-4" />
              Account
            </Link>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-7">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm font-medium text-primary">
            Free delivery on qualifying orders
          </p>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t bg-background px-4 py-5 md:hidden">
          <form action="/products" className="relative mb-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

            <Input
              name="search"
              type="search"
              placeholder="Search products..."
              className="h-11 rounded-full pl-12"
            />
          </form>

          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-5">
            <Link
              href="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium"
            >
              <Heart className="h-5 w-5" />
              Wishlist
            </Link>

            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
            </Link>

            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium"
            >
              <UserRound className="h-5 w-5" />
              Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}