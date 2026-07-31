import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ProductForm from "@/components/admin/ProductForm";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await connectDB();

  const categories = await Category.find({
    isActive: true,
  })
    .select("name")
    .sort({
      name: 1,
    })
    .lean();

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

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Product Management
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
          Add New Product
        </h1>

        <p className="mt-3 text-neutral-600">
          Add a new item to the NovaCart catalogue.
        </p>
      </div>

      {categoryOptions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-950">
            No active categories available
          </h2>

          <p className="mt-2 text-sm text-amber-800">
            Create or activate a category before adding a
            product.
          </p>

          <Link
            href="/admin/categories"
            className="mt-5 inline-flex rounded-xl bg-amber-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Manage Categories
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <ProductForm categories={categoryOptions} />
        </div>
      )}
    </div>
  );
}