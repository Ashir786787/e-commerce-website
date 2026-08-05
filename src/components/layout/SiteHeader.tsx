"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { categories } from "@/data/categories";
import ChatButton from "@/components/chat/ChatButton";
import NotificationBell from "@/components/notifications/NotificationBell";

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
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();
  const { totalItems: wishlistTotalItems } = useWishlist();

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
      } catch {
        setUser(null);
      } finally {
        setIsUserLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.fullName
    .trim()
    .split(/\s+/)
    .at(-1);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory !== "All") {
      const cat = categories.find((c) => c.name === selectedCategory);
      if (cat) params.set("category", cat.slug);
    }
    router.push(`/products?${params.toString()}`);
  }

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
    } catch {
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-primary sm:text-2xl"
        >
          NovaCart
        </Link>

        <form
          onSubmit={handleSearch}
          className="ml-4 hidden flex-1 max-w-2xl md:flex"
        >
          <div className="relative flex items-center" ref={categoryRef}>
            <button
              type="button"
              onClick={() => setIsCategoryOpen((c) => !c)}
              className="flex h-10 items-center gap-1 rounded-l-lg border border-r-0 bg-muted/50 px-3 text-xs font-medium transition hover:bg-muted"
            >
              {selectedCategory}
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  isCategoryOpen && "rotate-180"
                )}
              />
            </button>
            {isCategoryOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border bg-background shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setIsCategoryOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-muted",
                    selectedCategory === "All" && "bg-muted font-medium"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setIsCategoryOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-muted",
                      selectedCategory === cat.name && "bg-muted font-medium"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NovaCart..."
            className="h-10 flex-1 border border-l-0 border-r-0 bg-background px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="flex h-10 w-12 items-center justify-center rounded-r-lg bg-primary text-primary-foreground transition hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/wishlist"
            aria-label={`Wishlist with ${wishlistTotalItems} items`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "hidden sm:flex"
            )}
          >
            <span className="relative">
              <Heart className="h-5 w-5" />
              {wishlistTotalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {wishlistTotalItems > 99 ? "99+" : wishlistTotalItems}
                </span>
              )}
            </span>
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-lg p-2 transition hover:bg-muted"
            aria-label={`Shopping cart with ${totalItems} items`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden text-sm font-medium sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          {user && <NotificationBell targetKey={user.id} />}
          {user ? (
            <div className="relative ml-1">
              <Button
                type="button"
                variant="outline"
                className="max-w-40 rounded-full"
                onClick={() => setIsAccountMenuOpen((c) => !c)}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
              >
                <div className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {displayName?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden truncate sm:inline">{displayName}</span>
                <ChevronDown
                  className={cn(
                    "ml-1 h-4 w-4 transition-transform",
                    isAccountMenuOpen && "rotate-180"
                  )}
                />
              </Button>
              {isAccountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border bg-background p-2 shadow-xl"
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
                "ml-1 rounded-full"
              )}
            >
              <UserRound className="mr-2 h-4 w-4" />
              {isUserLoading ? "..." : "Account"}
            </Link>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-1 md:hidden"
          onClick={() => setIsMenuOpen((c) => !c)}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      <div className="border-t px-4 py-2 md:hidden">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search NovaCart..."
            className="h-10 flex-1 rounded-l-lg border border-r-0 bg-background px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="flex h-10 w-12 items-center justify-center rounded-r-lg bg-primary text-primary-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="hidden md:block border-t">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6">
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
          <p className="text-xs font-medium text-muted-foreground">
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
              className="relative flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium"
            >
              <span className="relative">
                <Heart className="h-5 w-5" />
                {wishlistTotalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {wishlistTotalItems > 99 ? "99+" : wishlistTotalItems}
                  </span>
                )}
              </span>
              Wishlist
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="relative flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium"
            >
              <span className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </span>
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

    {!user || user.role !== "admin" ? (
      <ChatButton
        user={
          user
            ? {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
              }
            : null
        }
      />
    ) : null}
    </>
  );
}
