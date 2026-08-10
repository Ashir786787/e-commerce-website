import { NextResponse } from "next/server";

import {
  GEMINI_MODEL,
  gemini,
} from "@/lib/gemini";

export async function GET() {
  try {
    const response =
      await gemini.models.generateContent({
        model: GEMINI_MODEL,
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
    console.error(
      "Gemini connection test error:",
      error
    );

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