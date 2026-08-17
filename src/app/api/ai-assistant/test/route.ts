import { NextResponse } from "next/server";

import {
  GEMINI_MODEL,
  isGeminiConfigured,
  generateContentWithFallback,
} from "@/lib/gemini";

export async function GET() {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        success: false,
        message:
          "GEMINI_API_KEY is not configured. Add it to the environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await generateContentWithFallback({
      contents:
        "Reply with exactly: NovaCart Gemini connection successful.",
    });

    return NextResponse.json({
      success: true,
      message: "Gemini connection successful.",
      data: {
        response: response.text,
        model: GEMINI_MODEL,
      },
    });
  } catch (error) {
    console.error("Gemini connection test error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gemini connection failed.",
      },
      {
        status: 500,
      }
    );
  }
}
