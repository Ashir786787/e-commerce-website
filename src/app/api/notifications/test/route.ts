import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/services/auth.service";
import { sendPushNotification } from "@/services/fcm-token.service";

export async function POST() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    const messageId = await sendPushNotification({
      userId: currentUser.id.toString(),
      title: "NovaCart Notifications",
      body: "Firebase push notifications are working successfully.",
      url: "/orders",
    });

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully.",
      data: { messageId },
    });
  } catch (error) {
    console.error("Send test notification error:", error);

    const message = error instanceof Error ? error.message : "Unable to send notification.";

    return NextResponse.json(
      { success: false, message },
      { status: message === "Not authenticated." ? 401 : 400 }
    );
  }
}
