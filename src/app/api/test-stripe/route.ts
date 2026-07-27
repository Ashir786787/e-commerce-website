import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    secret: !!process.env.STRIPE_SECRET_KEY,
    publishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });
}
