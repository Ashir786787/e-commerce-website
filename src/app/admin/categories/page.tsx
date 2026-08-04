import Link from "next/link";
import { Edit3, FolderOpen, Plus, Search } from "lucide-react";
import { Types } from "mongoose";

import CategoryForm from "@/components/admin/CategoryForm";
import CategoryImage from "@/components/admin/CategoryImage";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

interface AdminCategoriesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    edit?: string;
    create?: string;
  }>;
}

export default async function AdminCategoriesPage({
  searchParams,
}: AdminCategoriesPageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search.trim() : "";
  const status =
    params.status === "active" || params.status === "inactive"
      ? params.status
      : "";
  const editId = typeof params.edit === "string" ? params.edit : "";
  const showCreateForm = params.create === "true";

  await connectDB();

  const query: Record<string, unknown> = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (status === "active") {
    query.isActive = true;
  }

  if (status === "inactive") {
    query.isActive = false;
  }

  const [categories, totalCategories, activeCategories, productCounts, editingCategory] =
    await Promise.all([
      Category.find(query).sort({ createdAt: -1 }).lean(),
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Product.aggregate<{ _id: Types.ObjectId; count: number }>([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      editId && Types.ObjectId.isValid(editId) ? Category.findById(editId).lean() : null,
    ]);

  const productCountMap = new Map(
    productCounts.map((item) => [item._id.toString(), item.count])
  );

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Category Management
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 sm:text-4xl">
            Categories
          </h1>
          <p className="mt-3 text-neutral-600">
            Organize products and manage marketplace categories.
          </p>
        </div>
        <Link
          href="/admin/categories?create=true"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-fit"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Total Categories</p>
          <p className="mt-2 text-3xl font-bold text-neutral-950">
            {totalCategories}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Active Categories</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeCategories}
          </p>
        </article>

        <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Current Results</p>
          <p className="mt-2 text-3xl font-bold text-neutral-950">
            {categories.length}
          </p>
        </article>
      </div>

      {showCreateForm && (
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-950">
                Add New Category
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Create a category for organizing NovaCart products.
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-sm font-semibold text-neutral-600 transition hover:text-indigo-600"
            >
              Close
            </Link>
          </div>
          <CategoryForm />
        </section>
      )}

      {editId && editingCategory && (
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-950">
                Edit Category
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Update category information and visibility.
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-sm font-semibold text-neutral-600 transition hover:text-indigo-600"
            >
              Close
            </Link>
          </div>
          <CategoryForm
            category={{
              id: editingCategory._id.toString(),
              name: editingCategory.name,
              slug: editingCategory.slug,
              description: editingCategory.description || "",
              image: editingCategory.image || "",
              isActive: editingCategory.isActive,
            }}
          />
        </section>
      )}

      {editId && !editingCategory && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          The selected category could not be found.
        </div>
      )}

      <form className="mt-8 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_200px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search by category name, slug or description..."
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <div className="flex gap-3">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Apply
          </button>
          <Link
            href="/admin/categories"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-neutral-300 bg-white px-5 text-sm font-semibold text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            Reset
          </Link>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-neutral-300" />
            <h2 className="mt-4 text-xl font-semibold text-neutral-950">
              No categories found
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              Try changing your filters or create a new category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead className="bg-neutral-50">
                <tr className="border-b border-neutral-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Products
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
                {categories.map((category) => {
                  const productCount = productCountMap.get(category._id.toString()) || 0;

                  return (
                    <tr
                      key={category._id.toString()}
                      className="transition hover:bg-neutral-50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                            <CategoryImage
                              src={category.image || ""}
                              alt={category.name}
                              sizes="56px"
                              className="object-cover"
                              fallback={
                                <div className="flex h-full w-full items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
                                  {category.name.charAt(0).toUpperCase()}
                                </div>
                              }
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-950">
                              {category.name}
                            </p>
                            <p className="mt-1 max-w-[320px] truncate text-sm text-neutral-500">
                              {category.description || "No description provided."}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <code className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700">
                          {category.slug}
                        </code>
                      </td>

                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                          {productCount}{" "}
                          {productCount === 1 ? "product" : "products"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/admin/categories?edit=${category._id.toString()}`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Link>
                          <DeleteCategoryButton
                            categoryId={category._id.toString()}
                            categoryName={category.name}
                            productCount={productCount}
                          />
                        </div>
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
