import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/services/auth.service";
import Review from "@/models/Review";
import { recalculateProductRating } from "@/services/review.service";

interface RouteContext {
  params: Promise<{ reviewId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { reviewId } = await params;
    const body = await request.json();

    await connectDB();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (body.isVisible !== undefined) {
      review.isVisible = body.isVisible;
    }

    await review.save();

    void recalculateProductRating(review.product.toString());

    return NextResponse.json({ message: "Review updated", review });
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { reviewId } = await params;

    await connectDB();

    const review = await Review.findById(reviewId);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const productId = review.product.toString();
    await Review.findByIdAndDelete(reviewId);

    void recalculateProductRating(productId);

    return NextResponse.json({ message: "Review deleted" });
  } catch {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
