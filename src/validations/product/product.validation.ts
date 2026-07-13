import { z } from "zod";

const productBaseSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters.")
    .max(150, "Product name cannot exceed 150 characters."),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Product slug must be at least 3 characters.")
    .max(180, "Product slug cannot exceed 180 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may only contain lowercase letters, numbers, and hyphens."
    ),

  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters.")
    .max(250, "Short description cannot exceed 250 characters."),

  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(5000, "Description cannot exceed 5000 characters."),

  price: z
    .number({
      message: "Price must be a number.",
    })
    .nonnegative("Price cannot be negative."),

  discountPrice: z
    .number({
      message: "Discount price must be a number.",
    })
    .nonnegative("Discount price cannot be negative.")
    .optional(),

  category: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Category is required.")
    .max(80, "Category cannot exceed 80 characters."),

  brand: z
    .string()
    .trim()
    .min(2, "Brand is required.")
    .max(80, "Brand cannot exceed 80 characters."),

  images: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Each product image must have a valid path.")
    )
    .min(1, "At least one product image is required.")
    .max(8, "A product can have a maximum of 8 images."),

  thumbnail: z
    .string()
    .trim()
    .min(1, "Product thumbnail is required."),

  stock: z
    .number({
      message: "Stock must be a number.",
    })
    .int("Stock must be a whole number.")
    .nonnegative("Stock cannot be negative."),

  sku: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "SKU must be at least 3 characters.")
    .max(50, "SKU cannot exceed 50 characters.")
    .regex(
      /^[A-Z0-9_-]+$/,
      "SKU may only contain uppercase letters, numbers, hyphens, and underscores."
    ),

  rating: z
    .number({
      message: "Rating must be a number.",
    })
    .min(0, "Rating cannot be below 0.")
    .max(5, "Rating cannot exceed 5.")
    .default(0),

  numReviews: z
    .number({
      message: "Review count must be a number.",
    })
    .int("Review count must be a whole number.")
    .nonnegative("Review count cannot be negative.")
    .default(0),

  featured: z.boolean().default(false),

  isActive: z.boolean().default(true),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tags cannot be empty.")
        .max(40, "Each tag cannot exceed 40 characters.")
    )
    .max(15, "A product can have a maximum of 15 tags.")
    .default([]),
});

export const createProductSchema = productBaseSchema.superRefine(
  (product, context) => {
    if (
      product.discountPrice !== undefined &&
      product.discountPrice >= product.price
    ) {
      context.addIssue({
        code: "custom",
        path: ["discountPrice"],
        message: "Discount price must be lower than the regular price.",
      });
    }

    if (!product.images.includes(product.thumbnail)) {
      context.addIssue({
        code: "custom",
        path: ["thumbnail"],
        message: "Thumbnail must also be included in the product images.",
      });
    }
  }
);

export const updateProductSchema = productBaseSchema
  .partial()
  .superRefine((product, context) => {
    if (
      product.price !== undefined &&
      product.discountPrice !== undefined &&
      product.discountPrice >= product.price
    ) {
      context.addIssue({
        code: "custom",
        path: ["discountPrice"],
        message: "Discount price must be lower than the regular price.",
      });
    }

    if (
      product.thumbnail !== undefined &&
      product.images !== undefined &&
      !product.images.includes(product.thumbnail)
    ) {
      context.addIssue({
        code: "custom",
        path: ["thumbnail"],
        message: "Thumbnail must also be included in the product images.",
      });
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;