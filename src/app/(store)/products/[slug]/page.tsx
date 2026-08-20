import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";

export const dynamic = "force-dynamic";

import ProductActions from "@/components/product/ProductActions";
import ImageGallery from "@/components/product/ImageGallery";
import ProductPageActions from "@/components/product/ProductPageActions";
import ProductDetailTabs from "@/components/product/ProductDetailTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import ReviewsSection from "@/components/product/ReviewsSection";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import "@/models/Category";
import "@/models/Review";
import "@/models/User";
import Product from "@/models/Product";
import {
  getProductReviews,
  getProductRatingStats,
} from "@/services/review.service";
import { resolveUserId } from "@/lib/user";
import { verifyToken } from "@/utils/jwt";
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
  const categoryId =
    typeof product.category === "object" && product.category?._id
      ? product.category._id
      : typeof product.category === "string"
        ? product.category
        : null;

  const productId = product._id.toString();

  const [reviews, stats, relatedProducts] = await Promise.all([
    getProductReviews(productId),
    getProductRatingStats(productId),
    categoryId
      ? Product.find({
          category: categoryId,
          _id: { $ne: product._id },
          isActive: true,
        })
          .populate("category", "name slug")
          .sort({ rating: -1, reviewCount: -1 })
          .limit(8)
          .lean()
      : [],
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
      } catch {}
    }
  } catch {}

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : undefined;

  const savingsAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  return (
    <main className="pb-24 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-8 sm:px-6 sm:pt-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground sm:mb-8">
          <Link
            href="/products"
            className="flex items-center gap-1 transition hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Products
          </Link>
          {categorySlug && (
            <>
              <span>/</span>
              <Link
                href={`/categories/${categorySlug}`}
                className="transition hover:text-primary"
              >
                {category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <ImageGallery
              images={product.images}
              productName={product.name}
              discount={discount}
            />
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary sm:text-sm">
              {category}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:mt-3 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Brand:{" "}
              <span className="font-medium text-foreground">
                {product.brand}
              </span>
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1 rounded bg-amber-50 px-2 py-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-amber-700">
                  {product.rating}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount}{" "}
                {product.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-2xl font-bold text-primary sm:text-3xl">
                Rs. {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    Rs. {formatPrice(product.originalPrice)}
                  </span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                    Save Rs. {formatPrice(savingsAmount)}
                  </span>
                </>
              )}
            </div>

            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {product.description.length > 200
                ? product.description.slice(0, 200) + "..."
                : product.description}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  product.stock > 0 ? "bg-emerald-500" : "bg-red-500"
                }`}
              />
              <p className="text-sm font-medium">
                {product.stock > 0
                  ? `In Stock — ${product.stock} items available`
                  : "Out of Stock"}
              </p>
            </div>

            <ProductPageActions
              productName={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              productId={productId}
              stock={product.stock}
            >
              <div className="mt-6">
                <ProductActions
                  productId={productId}
                  stock={product.stock}
                />
              </div>
            </ProductPageActions>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                <Truck className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Fast Delivery</p>
                  <p className="text-[11px] text-muted-foreground">
                    Over Rs. 5,000
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Secure Checkout</p>
                  <p className="text-[11px] text-muted-foreground">
                    100% protected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
                <PackageCheck className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Easy Returns</p>
                  <p className="text-[11px] text-muted-foreground">
                    7-day policy
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <div className="mt-10 border-t sm:mt-14">
          <ProductDetailTabs
            description={product.description}
            brand={product.brand}
          />
        </div>

        <ReviewsSection
          productId={productId}
          currentUserId={currentUserId}
          isLoggedIn={isLoggedIn}
          initialReviews={reviews}
          initialStats={stats}
        />
      </div>

      {relatedProducts.length > 0 && (
        <div className="border-t">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </main>
  );
}
