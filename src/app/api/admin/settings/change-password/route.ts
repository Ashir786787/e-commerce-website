import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/services/auth.service";
import { changePasswordSchema } from "@/validations/change-password.validation";
import { hashPassword, comparePassword } from "@/utils/password";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid input.";
      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    const user = await User.findById(currentUser.id).select("password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const isCorrect = await comparePassword(
      parsed.data.currentPassword,
      user.password
    );
    if (!isCorrect) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    user.password = await hashPassword(parsed.data.newPassword);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update password.",
      },
      { status: 500 }
    );
  }
}
