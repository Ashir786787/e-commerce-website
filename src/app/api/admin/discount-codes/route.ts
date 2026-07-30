import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { generateCode } from "@/lib/discount";
import DiscountCode from "@/models/DiscountCode";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const codes = await DiscountCode.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: codes });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await request.json();
    const count = Math.min(Math.max(parseInt(body.count) || 1, 1), 100);
    const discountPercent = parseFloat(body.discountPercent);

    if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json(
        { success: false, message: "Percent must be between 1 and 100" },
        { status: 400 }
      );
    }

    let expiresAt: Date | undefined;
    if (body.expiresAt) {
      expiresAt = new Date(body.expiresAt);
      if (isNaN(expiresAt.getTime())) return NextResponse.json({ success: false, message: "Invalid date" }, { status: 400 });
    }

    const codes: string[] = [];
    const docs: { code: string; discountPercent: number; isActive: boolean; expiresAt?: Date; usedBy: [] }[] = [];

    while (codes.length < count) {
      const code = generateCode();
      const exists = await DiscountCode.findOne({ code });
      if (!exists) {
        codes.push(code);
        docs.push({ code, discountPercent, isActive: true, expiresAt, usedBy: [] });
      }
    }

    await DiscountCode.insertMany(docs);
    return NextResponse.json({ success: true, data: { codes, discountPercent, count } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to generate codes" },
      { status: 500 }
    );
  }
}