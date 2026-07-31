"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";

type CategoryFormProps = {
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    isActive: boolean;
  };
};

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
};

function generateSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryForm({
  category,
}: CategoryFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<CategoryFormState>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image: category?.image || "",
    isActive: category?.isActive ?? true,
  });

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  function updateField<K extends keyof CategoryFormState>(
    field: K,
    value: CategoryFormState[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        current.slug === generateSlug(current.name) ||
        current.slug === ""
          ? generateSlug(value)
          : current.slug,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await fetch(
        category
          ? `/api/admin/categories/${category.id}`
          : "/api/admin/categories",
        {
          method: category ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description,
            image: form.image,
            isActive: form.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Unable to save category."
        );
      }

      toast.success(
        category
          ? "Category updated successfully."
          : "Category created successfully."
      );

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save category."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-neutral-950">
          Category Information
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Enter the category details shown across NovaCart.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Category Name
            </label>

            <input
              id="name"
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              placeholder="Electronics"
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Slug
            </label>

            <input
              id="slug"
              required
              value={form.slug}
              onChange={(event) =>
                updateField(
                  "slug",
                  generateSlug(event.target.value)
                )
              }
              placeholder="electronics"
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Description
            </label>

            <textarea
              id="description"
              rows={5}
              maxLength={500}
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Describe the category..."
              className="w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

            <p className="mt-2 text-right text-xs text-neutral-400">
              {form.description.length}/500
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="image"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Image URL
            </label>

            <input
              id="image"
              type="url"
              value={form.image}
              onChange={(event) =>
                updateField("image", event.target.value)
              }
              placeholder="https://example.com/category-image.jpg"
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

            <p className="mt-2 text-xs text-neutral-500">
              Optional publicly accessible image URL.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-neutral-950">
          Visibility
        </h2>

        <label
          className={`mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
            form.isActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-neutral-200 hover:border-indigo-300"
          }`}
        >
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              updateField(
                "isActive",
                event.target.checked
              )
            }
            className="mt-1 h-4 w-4 accent-indigo-600"
          />

          <div>
            <p className="font-semibold text-neutral-950">
              Active Category
            </p>

            <p className="mt-1 text-sm text-neutral-500">
              Allow customers and products to use this category.
            </p>
          </div>
        </label>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push("/admin/categories")
          }
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 text-sm font-semibold text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />

          {isSubmitting
            ? category
              ? "Updating Category..."
              : "Creating Category..."
            : category
              ? "Update Category"
              : "Create Category"}
        </button>
      </div>
    </form>
  );
}