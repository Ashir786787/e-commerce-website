import { NextRequest } from "next/server";

import { connectDB } from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import { newsletterSchema } from "@/validations/newsletter";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message || "Invalid email address.",
        400
      );
    }

    await connectDB();

    const email = parsed.data.email;

    await Newsletter.findOneAndUpdate(
      { email },
      { $set: { subscribed: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return successResponse(
      "You have been subscribed to the NovaCart newsletter."
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to subscribe. Please try again.",
      500
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.issues[0]?.message || "Invalid email address.",
        400
      );
    }

    await connectDB();

    const email = parsed.data.email;

    await Newsletter.updateOne(
      { email },
      { $set: { subscribed: false } }
    );

    return successResponse(
      "You have been unsubscribed from the NovaCart newsletter."
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to unsubscribe. Please try again.",
      500
    );
  }
}
