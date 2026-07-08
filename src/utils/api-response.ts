import { NextResponse } from "next/server";

export function successResponse(
  message: string,
  data?: unknown,
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status = 500
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}
