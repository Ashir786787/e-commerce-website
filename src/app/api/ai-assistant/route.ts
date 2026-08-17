import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { resolveUserId } from "@/lib/user";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  GeminiNotConfiguredError,
  isGeminiConfigured,
} from "@/lib/gemini";
import { aiAssistantSchema } from "@/validations/ai-assistant.validation";
import { generateAssistantResponse } from "@/services/ai-assistant.service";
import { successResponse, errorResponse } from "@/utils/api-response";

export const runtime = "nodejs";

const USER_LIMIT = 10;
const IP_LIMIT = 30;
const WINDOW_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    if (!isGeminiConfigured()) {
      return errorResponse(
        "The AI assistant is not configured yet. Please try again later.",
        503
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid request body.", 400);
    }

    const parsed = aiAssistantSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message || "Invalid message.";
      return errorResponse(message, 400);
    }

    const userId = await resolveUserId();

    const userRate = checkRateLimit(
      `ai-assistant:user:${userId}`,
      USER_LIMIT,
      WINDOW_MS
    );

    if (userRate.limited) {
      const retryAfter = Math.max(
        1,
        Math.ceil((userRate.resetAt - Date.now()) / 1000)
      );

      return NextResponse.json(
        {
          success: false,
          message: `You're sending messages too quickly. Please wait ${retryAfter}s before continuing.`,
          data: { retryAfter },
        },
        { status: 429 }
      );
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";

    const ipRate = checkRateLimit(
      `ai-assistant:ip:${ip}`,
      IP_LIMIT,
      WINDOW_MS
    );

    if (ipRate.limited) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many requests from your location. Please try again in a minute.",
        },
        { status: 429 }
      );
    }

    await connectDB();

    const result = await generateAssistantResponse({
      message: parsed.data.message,
      userId,
      history: parsed.data.history,
    });

    return successResponse("Response generated.", result);
  } catch (error) {
    console.error("AI assistant error:", error);

    if (error instanceof GeminiNotConfiguredError) {
      return errorResponse(
        "The AI assistant is not configured yet. Please try again later.",
        503
      );
    }

    return errorResponse(
      "I ran into a problem generating a response. Please try again in a moment.",
      500
    );
  }
}
