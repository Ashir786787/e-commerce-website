import { NextRequest, NextResponse } from "next/server";
import { resolveUserId } from "@/lib/user";
import { validateDiscountCode } from "@/lib/discount";

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Login required" }, { status: 401 });

    const { code } = await request.json();
    if (!code || typeof code !== "string") return NextResponse.json({ success: false, message: "Code is required" }, { status: 400 });

    const result = await validateDiscountCode(code, userId);
    return NextResponse.json({ success: true, data: { discountPercent: result.discountPercent } });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Validation failed" },
      { status: 400 }
    );
  }
}