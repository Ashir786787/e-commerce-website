import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { role: "user" };
    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ fullName: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("fullName email")
        .sort({ fullName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        _id: u._id.toString(),
        fullName: u.fullName,
        email: u.email,
      })),
      pagination: {
        page,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch users" },
      { status: 500 }
    );
  }
}
