import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import Newsletter from "@/models/Newsletter";

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Subscriber id is required." },
        { status: 400 }
      );
    }

    const subscriber = await Newsletter.findByIdAndUpdate(
      id,
      { $set: { subscribed: Boolean(body.subscribed) } },
      { new: true }
    ).lean();

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: "Subscriber not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: subscriber });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update subscriber",
      },
      { status: 500 }
    );
  }
}
