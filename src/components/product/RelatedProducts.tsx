import ProductCard from "@/components/product/ProductCard";
import ProductCarousel from "@/components/home/ProductCarousel";
import { getCategoryName } from "@/lib/utils";

interface RelatedProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: { url: string; publicId?: string }[];
  category: { name: string; slug: string } | string;
  rating: number;
  reviewCount: number;
}

interface RelatedProductsProps {
  products: RelatedProduct[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold sm:text-2xl">You May Also Like</h2>
        </div>

        <ProductCarousel itemWidth={200} gap={16}>
          {products.map((product, index) => (
            <div
              key={product._id.toString()}
              className="w-[180px] shrink-0 sm:w-[200px]"
            >
              <ProductCard
                priority={index < 2}
                product={{
                  id: product._id.toString(),
                  slug: product.slug,
                  name: product.name,
                  category: getCategoryName(product.category),
                  price: product.price,
                  originalPrice: product.originalPrice,
                  rating: product.rating,
                  reviews: product.reviewCount,
                  image:
                    product.images[0]?.url ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10",
                  discount:
                    product.originalPrice && product.originalPrice > product.price
                      ? Math.round(
                          ((product.originalPrice - product.price) /
                            product.originalPrice) *
                            100
                        )
                      : undefined,
                }}
              />
            </div>
          ))}
        </ProductCarousel>
      </div>
    </section>
  );
}
