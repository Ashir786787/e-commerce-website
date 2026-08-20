"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save, Trash2, Upload } from "lucide-react";
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

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 4 * 1024 * 1024;

export default function CategoryForm({
  category,
}: CategoryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<CategoryFormState>({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    image: category?.image || "",
    isActive: category?.isActive ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
        current.slug === generateSlug(current.name) || current.slug === ""
          ? generateSlug(value)
          : current.slug,
    }));
  }

  async function handleFileUpload(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, GIF or AVIF images are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be 4MB or smaller.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Upload failed.");
      }

      updateField("image", result.data.url);
      toast.success("Image uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        throw new Error(result.message || result.error || "Unable to save category.");
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
            <label className="mb-2 block text-sm font-medium text-neutral-800">
              Category Image
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {form.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image}
                    alt="Category preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-neutral-400">
                    <ImagePlus className="h-8 w-8" />
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </button>

                  <button
                    type="button"
                    disabled={!form.image}
                    onClick={() => updateField("image", "")}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="image"
                    type="url"
                    value={form.image}
                    onChange={(event) =>
                      updateField("image", event.target.value)
                    }
                    placeholder="https://res.cloudinary.com/.../category.jpg"
                    className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>

                <p className="text-xs text-neutral-500">
                  Supports JPG, PNG, WEBP, GIF and AVIF. Max 4MB.
                </p>
              </div>
            </div>
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
          disabled={isSubmitting || isUploading}
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