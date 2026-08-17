import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import { getCurrentUser } from "@/services/auth.service";
import { recalculateProductRating } from "@/services/review.service";
import { updateReviewSchema } from "@/validations/review.validation";

interface RouteContext {
  params: Promise<{ id: string; reviewId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { id, reviewId } = await params;
    const body = await request.json();

    const parsed = updateReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await Review.findOne({ _id: reviewId, product: id });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin";
    const isOwner = review.user.toString() === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (parsed.data.rating !== undefined) review.rating = parsed.data.rating;
    if (parsed.data.title !== undefined) review.title = parsed.data.title;
    if (parsed.data.comment !== undefined) review.comment = parsed.data.comment;

    await review.save();

    void recalculateProductRating(id);

    return NextResponse.json({ message: "Review updated", review });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update review";
    if (message === "Not authenticated.") {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { id, reviewId } = await params;

    await connectDB();

    const review = await Review.findOne({ _id: reviewId, product: id });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin";
    const isOwner = review.user.toString() === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await Review.findByIdAndDelete(reviewId);

    void recalculateProductRating(id);

    return NextResponse.json({ message: "Review deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete review";
    if (message === "Not authenticated.") {
      return NextResponse.json({ error: "Please sign in" }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
