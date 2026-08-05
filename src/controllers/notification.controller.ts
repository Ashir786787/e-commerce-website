import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/api-response";
import { saveFCMToken } from "@/services/fcm-token.service";

interface SaveTokenBody {
  token?: string;
}

export async function saveNotificationTokenController(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    const userId = currentUser.id.toString();

    const body = (await request.json()) as SaveTokenBody;

    if (!body.token) {
      return errorResponse("Notification token is required.", 400);
    }

    const result = await saveFCMToken(userId, body.token);

    return successResponse("Notification token saved successfully.", result);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Unable to save notification token.",
      400
    );
  }
}
