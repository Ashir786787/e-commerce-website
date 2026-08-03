import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Types } from "mongoose";

import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ProductForm from "@/components/admin/ProductForm";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();

  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),

    Category.find({
      isActive: true,
    })
      .select("name")
      .sort({
        name: 1,
      })
      .lean(),
  ]);

  if (!product) {
    notFound();
  }

  const categoryOptions = categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
  }));

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Product Management
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Edit Product
          </h1>

          <p className="mt-3 text-neutral-600">
            Update product information, inventory and visibility.
          </p>
        </div>

        <DeleteProductButton
          productId={product._id.toString()}
          productName={product.name}
        />
      </div>

      <div className="mt-8">
        <ProductForm
          categories={categoryOptions}
          product={{
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice,
            category: product.category.toString(),
            brand: product.brand,
            stock: product.stock,
            images: product.images.map(
              (image: { url: string; publicId?: string }) => ({
                url: image.url,
                publicId: image.publicId,
              })
            ),
            isFeatured: product.isFeatured,
            isTrending: product.isTrending,
            isActive: product.isActive,
          }}
        />
      </div>
    </div>
  );
}