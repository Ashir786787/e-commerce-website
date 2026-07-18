"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface MeResponse {
  success: boolean;
  message: string;
  data: AuthUser | null;
}

export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const result: MeResponse = await response.json();

        setUser(result.data);
      } catch (error) {
        console.error("Unable to load current user:", error);
        setUser(null);
      } finally {
        setIsUserLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const displayName = user?.fullName
    .trim()
    .split(/\s+/)
    .at(-1);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      setUser(null);
      setIsAccountMenuOpen(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Unable to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }
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
            {user ? (
              <div className="relative ml-2">
                <Button
                  type="button"
                  variant="outline"
                  className="max-w-44 rounded-full"
                  onClick={() =>
                    setIsAccountMenuOpen((current) => !current)
                  }
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                >
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {displayName?.charAt(0).toUpperCase()}
                  </div>

                  <span className="truncate">{displayName}</span>

                  <ChevronDown
                    className={cn(
                      "ml-2 h-4 w-4 transition-transform",
                      isAccountMenuOpen && "rotate-180"
                    )}
                  />
                </Button>

                {isAccountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border bg-background p-2 shadow-xl"
                  >
                    <div className="border-b px-3 py-3">
                      <p className="truncate text-sm font-semibold">
                        {user.fullName}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href="/account"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <UserRound className="h-4 w-4" />
                        My Profile
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Package className="h-4 w-4" />
                        My Orders
                      </Link>

                      <Link
                        href="/account/settings"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>

                      <Link
                        href="/wishlist"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                      >
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </Link>
                    </div>

                    <div className="border-t pt-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "ml-2 rounded-full"
                )}
              >
                <UserRound className="mr-2 h-4 w-4" />
                {isUserLoading ? "Loading..." : "Account"}
              </Link>
            )}
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
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAccountMenuOpen(true);
                }}
                className="flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {displayName?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-full truncate">{displayName}</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium"
              >
                <UserRound className="h-5 w-5" />
                Account
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
