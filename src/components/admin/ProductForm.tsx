"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Plus, Save, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductImage = {
  url: string;
  publicId?: string;
};

interface ProductFormProps {
  categories: CategoryOption[];
  product?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    brand: string;
    stock: number;
    images: ProductImage[];
    isFeatured: boolean;
    isTrending: boolean;
    isActive: boolean;
  };
}

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  brand: string;
  stock: string;
  images: ProductImage[];
  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;
};

function generateSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({
  categories,
  product,
}: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<ProductFormState>({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product ? String(product.price) : "",
    originalPrice:
      product?.originalPrice !== undefined
        ? String(product.originalPrice)
        : "",
    category: product?.category || "",
    brand: product?.brand || "",
    stock: product ? String(product.stock) : "0",
    images:
      product?.images && product.images.length > 0
        ? product.images
        : [{ url: "", publicId: undefined }],
    isFeatured: product?.isFeatured || false,
    isTrending: product?.isTrending || false,
    isActive: product?.isActive ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<
    number | null
  >(null);

  const fileInputRefs = useRef<Array<HTMLInputElement | null>>(
    []
  );

  function updateField<K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K]
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

  function updateImage(index: number, value: string) {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index
          ? { ...image, url: value }
          : image
      ),
    }));
  }

  async function handleFileUpload(
    index: number,
    file: File
  ) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be 4MB or smaller.");
      return;
    }

    setUploadingIndex(index);

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
        throw new Error(
          result.message || "Unable to upload image."
        );
      }

      const { url, publicId } = result.data;

      setForm((current) => ({
        ...current,
        images: current.images.map((image, imageIndex) =>
          imageIndex === index
            ? { url, publicId }
            : image
        ),
      }));

      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload image."
      );
    } finally {
      setUploadingIndex(null);
    }
  }

  function addImageField() {
    setForm((current) => ({
      ...current,
      images: [...current.images, { url: "", publicId: undefined }],
    }));
  }

  function removeImageField(index: number) {
    setForm((current) => {
      if (current.images.length === 1) {
        return current;
      }

      return {
        ...current,
        images: current.images.filter(
          (_, imageIndex) => imageIndex !== index
        ),
      };
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanImages = form.images
      .map((image) => ({
        url: image.url.trim(),
        publicId: image.publicId?.trim() || undefined,
      }))
      .filter((image) => image.url);

    if (cleanImages.length === 0) {
      toast.error("Add at least one product image URL.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        product
          ? `/api/admin/products/${product.id}`
          : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.name,
            slug: form.slug,
            description: form.description,
            price: Number(form.price),
            originalPrice: form.originalPrice
              ? Number(form.originalPrice)
              : null,
            category: form.category,
            brand: form.brand,
            stock: Number(form.stock),
            images: cleanImages,
            isFeatured: form.isFeatured,
            isTrending: form.isTrending,
            isActive: form.isActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to create product."
        );
      }

      toast.success(
        product
          ? "Product updated successfully."
          : "Product created successfully."
      );

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create product."
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
          Basic Information
        </h2>

        <p className="mt-2 text-sm text-neutral-500">
          Enter the main product details.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Product Name
            </label>

            <input
              id="name"
              required
              minLength={3}
              maxLength={150}
              value={form.name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              placeholder="For example: Wireless Gaming Mouse"
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
              placeholder="wireless-gaming-mouse"
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="brand"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Brand
            </label>

            <input
              id="brand"
              required
              maxLength={100}
              value={form.brand}
              onChange={(event) =>
                updateField("brand", event.target.value)
              }
              placeholder="NovaTech"
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
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Write a detailed product description..."
              className="w-full resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-neutral-950">
          Pricing and Inventory
        </h2>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Selling Price
            </label>

            <input
              id="price"
              required
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={(event) =>
                updateField("price", event.target.value)
              }
              placeholder="4999"
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="originalPrice"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Original Price
            </label>

            <input
              id="originalPrice"
              type="number"
              min="0"
              step="1"
              value={form.originalPrice}
              onChange={(event) =>
                updateField(
                  "originalPrice",
                  event.target.value
                )
              }
              placeholder="5999"
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Stock
            </label>

            <input
              id="stock"
              required
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) =>
                updateField("stock", event.target.value)
              }
              className="h-11 w-full rounded-xl border border-neutral-300 px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-neutral-800"
            >
              Category
            </label>

            <select
              id="category"
              required
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-950">
              Product Images
            </h2>

            <p className="mt-2 text-sm text-neutral-500">
              Upload images to Cloudinary or paste publicly accessible
              image URLs.
            </p>
          </div>

          <button
            type="button"
            onClick={addImageField}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            <Plus className="h-4 w-4" />
            Add Image
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {form.images.map((image, index) => {
            const isUploading = uploadingIndex === index;

            return (
              <div
                key={index}
                className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {image.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- arbitrary preview URLs are not covered by next/image remote patterns
                      <img
                        src={image.url}
                        alt={`Product image ${index + 1}`}
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
                        onClick={() => fileInputRefs.current[index]?.click()}
                        disabled={isUploading}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <UploadCloud className="h-4 w-4" />
                        {isUploading
                          ? "Uploading..."
                          : "Upload to Cloudinary"}
                      </button>

                      <input
                        ref={(element) => {
                          fileInputRefs.current[index] = element;
                        }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        className="hidden"
                        disabled={isUploading}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            handleFileUpload(index, file);
                          }
                          event.target.value = "";
                        }}
                      />

                      <button
                        type="button"
                        disabled={form.images.length === 1}
                        onClick={() => removeImageField(index)}
                        className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="url"
                        value={image.url}
                        onChange={(event) =>
                          updateImage(index, event.target.value)
                        }
                        placeholder="https://res.cloudinary.com/.../product.jpg"
                        className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                      />
                    </div>

                    <p className="text-xs text-neutral-500">
                      Upload from your computer or paste an image URL
                      directly.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-neutral-950">
          Product Visibility
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              key: "isActive" as const,
              title: "Active",
              description: "Show this product in the store.",
            },
            {
              key: "isFeatured" as const,
              title: "Featured",
              description: "Display in featured sections.",
            },
            {
              key: "isTrending" as const,
              title: "Trending",
              description: "Display in trending sections.",
            },
          ].map((option) => (
            <label
              key={option.key}
              className={`cursor-pointer rounded-xl border p-4 transition ${
                form[option.key]
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-neutral-200 hover:border-indigo-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={form[option.key]}
                  onChange={(event) =>
                    updateField(
                      option.key,
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-indigo-600"
                />

                <div>
                  <p className="font-semibold text-neutral-950">
                    {option.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    {option.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
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
            ? product
              ? "Updating Product..."
              : "Creating Product..."
            : product
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}