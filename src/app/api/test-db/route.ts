import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message: "✅ MongoDB Connected Successfully!",
    });
  } catch (error) {
    console.error("Database Connection Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "❌ Failed to connect to MongoDB",
      },
      {
        status: 500,
      }
    );
  }
}