import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import "@/models/User";

export async function recalculateProductRating(productId: string) {
  await connectDB();

  const result = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId), isVisible: true } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
  const reviewCount = result.length > 0 ? result[0].count : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    reviewCount,
  });
}

export async function getProductReviews(productId: string) {
  await connectDB();

  const reviews = await Review.find({ product: productId, isVisible: true })
    .populate({ path: "user", select: "fullName" })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(reviews));
}

export async function getProductRatingStats(productId: string) {
  await connectDB();

  const result = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId), isVisible: true } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const total = result.reduce((sum, r) => sum + r.count, 0);
  const avg = total > 0
    ? Math.round(
        (result.reduce((sum, r) => sum + r._id * r.count, 0) / total) * 10
      ) / 10
    : 0;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of result) {
    distribution[r._id] = r.count;
  }

  return { average: avg, total, distribution };
}

export async function canUserReview(userId: string, productId: string) {
  await connectDB();

  const existing = await Review.findOne({ user: userId, product: productId });
  if (existing) return false;

  const hasPurchased = await Review.aggregate([
    {
      $lookup: {
        from: "orders",
        localField: "order",
        foreignField: "_id",
        as: "orderData",
      },
    },
  ]);

  const purchased = await Review.exists({
    user: userId,
    product: productId,
  });

  return !purchased;
}
