import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment must be 1000 characters or less"),
  orderId: z.string().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(1).max(1000).optional(),
});
