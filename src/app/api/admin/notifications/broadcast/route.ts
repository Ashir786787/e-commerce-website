import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import User from "@/models/User";
import { sendPushNotificationToMany } from "@/services/fcm-token.service";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const reachableUsers = await User.countDocuments({ fcmToken: { $ne: "" } });

    return NextResponse.json({ success: true, data: { reachableUsers } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load notification stats.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const message = typeof body.body === "string" ? body.body.trim() : "";
    const url = typeof body.url === "string" && body.url.trim() ? body.url.trim() : "/";

    if (!title) {
      return NextResponse.json({ success: false, message: "Title is required." }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ success: false, message: "Message is required." }, { status: 400 });
    }

    const result = await sendPushNotificationToMany({ title, body: message, url });

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${result.sent} of ${result.total} users.`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to send notifications.",
      },
      { status: 500 }
    );
  }
}
