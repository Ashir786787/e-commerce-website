import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import ProductActions from "@/components/product/ProductActions";
import ReviewsSection from "@/components/product/ReviewsSection";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import "@/models/Category";
import "@/models/Review";
import "@/models/User";
import Product from "@/models/Product";
import { getProductReviews, getProductRatingStats } from "@/services/review.service";
import { resolveUserId } from "@/lib/user";
import { verifyToken } from "@/utils/jwt";

export const dynamic = "force-dynamic";
import { getCategoryName, getCategorySlug } from "@/lib/utils";

interface ProductDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK").format(price);
}

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const { slug } = await params;

  await connectDB();

  const product = await Product.findOne({
    slug,
    isActive: true,
  })
    .populate("category", "name slug")
    .lean();

  if (!product) {
    notFound();
  }

  const category = getCategoryName(product.category);
  const categorySlug = getCategorySlug(product.category);

  const productId = product._id.toString();

  const [reviews, stats] = await Promise.all([
    getProductReviews(productId),
    getProductRatingStats(productId),
  ]);

  let currentUserId: string | undefined;
  let isLoggedIn = false;
  try {
    currentUserId = await resolveUserId();
    const cookieStore = await cookies();
    const token = cookieStore.get("novacart_token")?.value;
    if (token) {
      try {
        verifyToken(token);
        isLoggedIn = true;
      } catch {
        // Guest user with invalid token
      }
    }
  } catch {
    // Guest user
  }

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : undefined;

  return (
    <main>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            {categorySlug && (
              <>
                <span>/</span>
                <Link
                  href={`/categories/${categorySlug}`}
                  className="hover:text-primary"
                >
                  {category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <section className="grid gap-12 lg:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-3xl border bg-muted">
              <Image
                src={product.images[0]?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10"}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
              {discount && (
                <span className="absolute left-5 top-5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                {category}
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Brand: <span className="font-medium text-foreground">{product.brand}</span>
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
              <div className="mt-7 flex items-end gap-4">
                <p className="text-3xl font-bold text-primary">
                  Rs. {formatPrice(product.price)}
                </p>
                {product.originalPrice && (
                  <p className="pb-1 text-lg text-muted-foreground line-through">
                    Rs. {formatPrice(product.originalPrice)}
                  </p>
                )}
              </div>
              <p className="mt-7 leading-7 text-muted-foreground">
                {product.description}
              </p>
              <div className="mt-7 rounded-2xl border bg-muted/20 p-5">
                <p className="font-semibold">
                  {product.stock > 0
                    ? `${product.stock} items available`
                    : "Out of stock"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.stock > 0
                    ? "Ready for delivery."
                    : "This product is currently unavailable."}
                </p>
              </div>
              <ProductActions
                productId={product._id.toString()}
                stock={product.stock}
              />
              <div className="mt-8 grid gap-4 border-t pt-8 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Fast Delivery</p>
                    <p className="text-xs text-muted-foreground">Reliable shipping</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Secure Checkout</p>
                    <p className="text-xs text-muted-foreground">Protected payments</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PackageCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">Simple process</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <ReviewsSection
            productId={productId}
            currentUserId={currentUserId}
            isLoggedIn={isLoggedIn}
            initialReviews={reviews}
            initialStats={stats}
          />
        </div>
    </main>
  );
}
