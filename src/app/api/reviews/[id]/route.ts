import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { getCurrentUser } from "@/services/auth.service";
import { recalculateProductRating, getProductReviews, getProductRatingStats } from "@/services/review.service";
import { createReviewSchema } from "@/validations/review.validation";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    await connectDB();

    const [reviews, stats] = await Promise.all([
      getProductReviews(id),
      getProductRatingStats(id),
    ]);

    return NextResponse.json({ reviews, stats });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();

    const parsed = createReviewSchema.safeParse({ ...body, productId: id });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Review.findOne({
      user: user.id,
      product: id,
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    let isVerifiedPurchase = false;
    if (parsed.data.orderId) {
      const order = await Order.findOne({
        _id: parsed.data.orderId,
        user: user.id,
        "items.product": id,
      });
      if (order) isVerifiedPurchase = true;
    } else {
      const hasPurchased = await Order.findOne({
        user: user.id,
        "items.product": id,
      });
      if (hasPurchased) isVerifiedPurchase = true;
    }

    const review = await Review.create({
      product: id,
      user: user.id,
      order: parsed.data.orderId || undefined,
      rating: parsed.data.rating,
      title: parsed.data.title,
      comment: parsed.data.comment,
      isVerifiedPurchase,
    });

    void recalculateProductRating(id);

    return NextResponse.json(
      { message: "Review submitted successfully", review },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create review";
    if (message === "Not authenticated.") {
      return NextResponse.json({ error: "Please sign in to leave a review" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
