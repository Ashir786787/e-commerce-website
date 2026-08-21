import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import DiscountCode from "@/models/DiscountCode";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const update: Record<string, unknown> = {};
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;
    if ("expiresAt" in body) {
      if (body.expiresAt === null) {
        update.expiresAt = null;
      } else if (body.expiresAt) {
        const d = new Date(body.expiresAt);
        if (isNaN(d.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid date" },
            { status: 400 }
          );
        }
        update.expiresAt = d;
      } else {
        update.expiresAt = undefined;
      }
    }

    const code = await DiscountCode.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: code });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;

    const code = await DiscountCode.findByIdAndDelete(id).lean();
    if (!code) {
      return NextResponse.json(
        { success: false, message: "Code not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete",
      },
      { status: 500 }
    );
  }
}
