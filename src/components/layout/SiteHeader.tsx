"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ChevronDown,
  Heart,
  HelpCircle,
  LogOut,
  Package,
  Search,
  Settings,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

interface SiteHeaderCategory {
  id: string;
  name: string;
  slug: string;
}

interface SiteHeaderProps {
  categories?: SiteHeaderCategory[];
}

const ChatButton = dynamic(
  () => import("@/components/chat/UnifiedChatButton"),
  { ssr: false }
);

const NotificationBell = dynamic(
  () => import("@/components/notifications/NotificationBell"),
  { ssr: false }
);

const mainNav = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories", hasMega: true },
  { label: "Deals", href: "/deals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const mobileQuickLinks = [
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?featured=true" },
  { label: "Trending", href: "/products?trending=true" },
  { label: "All Deals", href: "/deals" },
];

export default function SiteHeader({ categories = [] }: SiteHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: isUserLoading } = useAuth();
  const { totalItems } = useCart();
  const { totalItems: wishlistTotalItems } = useWishlist();

  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const catSlug = searchParams.get("category");
    const search = searchParams.get("search");
    if (catSlug) {
      const match = categories.find((c) => c.slug === catSlug);
      if (match) setSelectedCategory(match.name);
      else setSelectedCategory("All");
    } else {
      setSelectedCategory("All");
    }
    if (search) setSearchQuery(search);
  }, [searchParams, categories]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCategoryDropdownOpen(false);
      }
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const displayName = user?.fullName?.trim().split(/\s+/).at(-1);

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

  function closeMegaMenu() {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    megaTimerRef.current = setTimeout(() => setMegaMenuOpen(false), 120);
  }

  function handleMegaEnter() {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
  }

  function handleMegaLeave() {
    closeMegaMenu();
  }

  const logout = useCallback(async () => {
    try {
      setLoggingOut(true);
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Logout failed");
      setAccountMenuOpen(false);
      window.location.href = "/";
    } catch {
      setLoggingOut(false);
    }
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-border bg-background/98 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-background/80 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-bold tracking-tight text-primary sm:text-2xl"
          >
            NovaCart
          </Link>

          <form
            onSubmit={handleSearch}
            className="mx-4 hidden max-w-xl flex-1 md:block"
          >
            <div className="relative" ref={searchDropdownRef}>
              <div className="flex items-center rounded-full border bg-muted/40 transition-colors focus-within:border-primary/50 focus-within:bg-background focus-within:shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen((c) => !c)}
                  className="flex h-10 shrink-0 items-center gap-1.5 border-r border-border/60 pl-4 pr-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
                >
                  {selectedCategory === "All" ? "All" : selectedCategory}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isCategoryDropdownOpen && "rotate-180"
                    )}
                  />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, and more..."
                  className="h-10 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="mr-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>

              {isCategoryDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border bg-background shadow-2xl">
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All");
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted",
                        selectedCategory === "All" &&
                          "bg-muted font-medium text-primary"
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
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted",
                          selectedCategory === cat.name &&
                            "bg-muted font-medium text-primary"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>

          <div className="ml-auto flex items-center gap-0.5">
            <Link
              href="/wishlist"
              aria-label={`Wishlist with ${wishlistTotalItems} items`}
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground sm:flex"
            >
              <Heart className="h-5 w-5" />
              {wishlistTotalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {wishlistTotalItems > 99 ? "99+" : wishlistTotalItems}
                </span>
              )}
            </Link>

            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {user && <NotificationBell targetKey={user.id} />}

            {user ? (
              <div className="relative ml-1" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((c) => !c)}
                  className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 py-1.5 pl-1.5 pr-3 transition hover:bg-muted"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {displayName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-medium lg:inline">
                    {displayName}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform",
                      accountMenuOpen && "rotate-180"
                    )}
                  />
                </button>

                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border bg-background p-2 shadow-2xl"
                  >
                    <div className="border-b px-3 py-3">
                      <p className="truncate text-sm font-semibold">
                        {user.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1.5">
                      <Link
                        href="/account"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <UserRound className="h-4 w-4 text-muted-foreground" />
                        My Profile
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <Package className="h-4 w-4 text-muted-foreground" />
                        My Orders
                      </Link>
                      <Link
                        href="/account/settings"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Settings
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        Wishlist
                      </Link>
                    </div>
                    <div className="border-t pt-1.5">
                      <button
                        type="button"
                        onClick={logout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-1 hidden rounded-full border border-border/60 bg-muted/30 px-4 py-2 text-sm font-medium transition hover:bg-muted sm:block"
              >
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  {isUserLoading ? "..." : "Sign In"}
                </span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted md:hidden"
              aria-label="Open menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="hidden border-t md:block">
          <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
            {mainNav.map((item) =>
              item.hasMega ? (
                <div
                  key={item.href}
                  className="relative h-full"
                  ref={megaMenuRef}
                  onMouseEnter={handleMegaEnter}
                  onMouseLeave={handleMegaLeave}
                >
                  <Link
                    href={item.href}
                    className="flex h-full items-center gap-1 px-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        megaMenuOpen && "rotate-180"
                      )}
                    />
                  </Link>

                  {megaMenuOpen && (
                    <div
                      className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2"
                      onMouseEnter={handleMegaEnter}
                      onMouseLeave={handleMegaLeave}
                    >
                      <div className="w-[520px] rounded-2xl border bg-background p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Categories
                          </p>
                          <Link
                            href="/categories"
                            onClick={() => setMegaMenuOpen(false)}
                            className="flex items-center gap-1 text-xs font-medium text-primary transition hover:underline"
                          >
                            View All
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {categories.map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/categories/${cat.slug}`}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                                {cat.name.charAt(0)}
                              </div>
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-foreground"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="ml-auto">
              <p className="text-[11px] font-medium text-muted-foreground/70">
                Free delivery on orders over Rs. 5,000
              </p>
            </div>
          </div>
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-background shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b px-5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-bold text-primary"
              >
                NovaCart
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b px-5 py-3">
              <form onSubmit={handleSearch}>
                <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-3">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="px-5 pt-5 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Quick Links
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-5 pb-4">
                {mobileQuickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-xl border bg-muted/30 px-3 py-2.5 text-center text-xs font-semibold transition hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="border-t px-5 pt-4 pb-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Navigation
                </p>
              </div>
              <nav className="flex flex-col gap-0.5 px-3 pb-3">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-muted"
                  >
                    {item.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </nav>

              <div className="border-t px-5 pt-4 pb-3">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Categories
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-muted"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                        {cat.name.charAt(0)}
                      </div>
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t px-5 pt-4 pb-3">
                <Link
                  href="/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-muted"
                >
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  Help Center
                </Link>
              </div>
            </div>

            <div className="border-t px-5 py-4">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {displayName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <UserRound className="h-4 w-4" />
                  Sign In or Create Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <ChatButton
        user={
          user
            ? { id: user.id, fullName: user.fullName, email: user.email }
            : null
        }
      />
    </>
  );
}
