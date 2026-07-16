import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(3, "Product name must be at least 3 characters.").max(150, "Product name cannot exceed 150 characters."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers and hyphens only."),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000, "Description cannot exceed 5000 characters."),
  price: z.number().min(0, "Price cannot be negative."),
  originalPrice: z.number().min(0).optional(),
  category: z.string().min(1, "Category is required."),
  brand: z.string().trim().min(2).max(100),
  images: z.array(z.object({
    url: z.string(),
    publicId: z.string().optional(),
  })).min(1, "At least one image is required."),
  stock: z.number().min(0),
  sold: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
