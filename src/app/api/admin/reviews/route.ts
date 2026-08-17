import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/services/auth.service";
import Review from "@/models/Review";
import "@/models/Product";
import "@/models/User";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await connectDB();

    const reviews = await Review.find()
      .populate({ path: "product", select: "name" })
      .populate({ path: "user", select: "fullName email" })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
