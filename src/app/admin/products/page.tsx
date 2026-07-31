import Image from "next/image";
import Link from "next/link";
import {
  Edit3,
  PackageOpen,
  Plus,
  Search,
} from "lucide-react";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
  }>;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const params = await searchParams;

  const search =
    typeof params.search === "string"
      ? params.search.trim()
      : "";

  const selectedCategory =
    typeof params.category === "string"
      ? params.category
      : "";

  const status =
    params.status === "active" ||
    params.status === "inactive" ||
    params.status === "featured" ||
    params.status === "trending"
      ? params.status
      : "";

  await connectDB();

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        brand: {
          $regex: search,
          $options: "i",
        },
      },
      {
        slug: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (
    selectedCategory &&
    Types.ObjectId.isValid(selectedCategory)
  ) {
    query.category = selectedCategory;
  }

  if (status === "active") {
    query.isActive = true;
  }

  if (status === "inactive") {
    query.isActive = false;
  }

  if (status === "featured") {
    query.isFeatured = true;
  }

  if (status === "trending") {
    query.isTrending = true;
  }

  const [products, categories, totalProducts] =
    await Promise.all([
      Product.find(query)
        .populate({
          path: "category",
          select: "name slug",
        })
        .sort({
          createdAt: -1,
        })
        .lean(),

      Category.find()
        .select("name slug isActive")
        .sort({
          name: 1,
        })
        .lean(),

      Product.countDocuments(),
    ]);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Product Management
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Products
          </h1>

          <p className="mt-3 text-neutral-600">
            Create, edit and manage the NovaCart product
            catalogue.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-fit"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">
            Total Products
          </p>

          <p className="mt-2 text-3xl font-bold text-neutral-950">
            {totalProducts}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">
            Current Results
          </p>

          <p className="mt-2 text-3xl font-bold text-neutral-950">
            {products.length}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">
            Categories
          </p>

          <p className="mt-2 text-3xl font-bold text-neutral-950">
            {categories.length}
          </p>
        </div>
      </div>

      <form className="mt-6 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search by product, brand or slug..."
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <select
          name="category"
          defaultValue={selectedCategory}
          className="h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="">All categories</option>

          {categories.map((category) => (
            <option
              key={category._id.toString()}
              value={category._id.toString()}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="featured">Featured</option>
          <option value="trending">Trending</option>
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Apply
          </button>

          <Link
            href="/admin/products"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {products.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <PackageOpen className="mx-auto h-12 w-12 text-neutral-300" />

            <h2 className="mt-4 text-xl font-semibold text-neutral-950">
              No products found
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Try changing the current search or filter
              options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-neutral-50">
                <tr className="border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-200">
                {products.map((product) => {
                  const category =
                    product.category as unknown as {
                      name?: string;
                      slug?: string;
                    };

                  const image =
                    product.images?.[0]?.url ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10";

                  return (
                    <tr
                      key={product._id.toString()}
                      className="transition hover:bg-neutral-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[280px] truncate font-semibold text-neutral-950">
                              {product.name}
                            </p>

                            <p className="mt-1 text-sm text-neutral-500">
                              {product.brand}
                            </p>

                            <p className="mt-1 max-w-[280px] truncate text-xs text-neutral-400">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-neutral-700">
                        {category?.name ||
                          "Uncategorized"}
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-semibold text-neutral-950">
                          Rs. {formatPrice(product.price)}
                        </p>

                        {product.originalPrice &&
                          product.originalPrice >
                            product.price && (
                            <p className="mt-1 text-xs text-neutral-400 line-through">
                              Rs.{" "}
                              {formatPrice(
                                product.originalPrice
                              )}
                            </p>
                          )}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            product.stock === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock <= 5
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} available`}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex max-w-[220px] flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              product.isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                          {product.isFeatured && (
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                              Featured
                            </span>
                          )}

                          {product.isTrending && (
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                              Trending
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          href={`/admin/products/${product._id.toString()}/edit`}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}