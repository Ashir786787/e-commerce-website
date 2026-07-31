import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/services/auth.service";
import {
  getAdminStatistics,
  parsePeriod,
} from "@/services/statistics.service";

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access is required.",
        },
        {
          status: 403,
        }
      );
    }

    const period = parsePeriod(
      request.nextUrl.searchParams.get("period")
    );

    const data = await getAdminStatistics(period);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Load admin analytics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load analytics.",
      },
      {
        status: 500,
      }
    );
  }
}
